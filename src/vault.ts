import {Burn, Mint, Position, Swap, User, UserVaultBalance, Vault, FeeEarned} from "../generated/schema";
import {Address, BigInt, Bytes, store} from "@graphprotocol/graph-ts";
import {
    Minted as MintedEvent,
    Burned as BurnedEvent,
    Transfer as TransferEvent,
    PointsSet as PointsSetEvent,
    LiquidityAdded as LiquidityAddedEvent,
    LiquidityRemoved as LiquidityRemovedEvent,
    FeesUpdated as FeeUpdatedEvent,
    Swapped as SwappedEvent,
    FeesEarned as FeesEarnedEvent,
    InThePositionStatusSet as InThePositionStatusSetEvent,
    RangeProtocolVault
} from "../generated/RangeProtocolFactory/RangeProtocolVault";
import {bn, ZERO} from "./common";
import {IiZiSwapPool} from "../generated/RangeProtocolFactory/IiZiSwapPool";

/**
 * @dev Handles the recording of new mints happenings on the vault.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of MintedEvent.
 */
export function handleMinted(event: MintedEvent): void {
    const vault = Vault.load(event.address)!;
    if (vault.firstMintAtBlock.equals(ZERO)) {
        vault.firstMintAtBlock = event.block.number;
        vault.save();
    }

    const mint = new Mint(
        constructMintBurnId(
            event.address,
            event.params.receiver, 
            event.block.timestamp
        )
    );
    mint.receiver = event.params.receiver;
    mint.mintAmount = event.params.mintAmount;
    mint.amountXIn = event.params.amountXIn;
    mint.amountYIn = event.params.amountYIn;
    mint.timestamp = event.block.timestamp;
    mint.txHash = event.transaction.hash;
    mint.vault = vault.id;
    mint.save();

    const vaultId = Bytes.fromByteArray(event.address);
    const userVaultBalance = UserVaultBalance.load(vaultId.concat(event.params.receiver))!;
    userVaultBalance.tokenX = userVaultBalance.tokenX.plus(event.params.amountXIn);
    userVaultBalance.tokenY = userVaultBalance.tokenY.plus(event.params.amountYIn);
    userVaultBalance.save();

    if (vault.inThePosition) {
        const position = Position.load(vault.currentPosition!)!;
        position.tokenXAmount = position.tokenXAmount.plus(event.params.amountXIn);
        position.tokenYAmount = position.tokenYAmount.plus(event.params.amountYIn);
        position.save();
    }

    updateUnderlyingBalancesAndLiquidty(vault);
}

/**
 * @dev Handles the recording of new burns happenings on the vault.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of BurnedEvent.
 */
export function handleBurned(event: BurnedEvent): void {
    const burn = new Burn(
        constructMintBurnId(
            event.address,
            event.params.receiver,
            event.block.timestamp
        )
    );
    burn.receiver = event.params.receiver;
    burn.burnAmount = event.params.burnAmount;
    burn.amountXOut = event.params.amountXOut;
    burn.amountYOut = event.params.amountYOut;
    burn.timestamp = event.block.timestamp;
    burn.txHash = event.transaction.hash;
    burn.vault = Vault.load(event.address)!.id
    burn.save();

    const vault = Vault.load(event.address)!;

    if (vault.inThePosition) {
        const position = Position.load(vault.currentPosition!)!;
        position.tokenXWithdrawn = position.tokenXWithdrawn.plus(event.params.amountXOut);
        position.tokenYWithdrawn = position.tokenYWithdrawn.plus(event.params.amountYOut);
        position.save();
    }

    updateUnderlyingBalancesAndLiquidty(vault);
}

/**
 * @dev Fired when liquidity is added to the vault.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of LiquidityAddedEvent.
 */
export function liquidityAddedHandler(event: LiquidityAddedEvent): void {
    const vault = Vault.load(event.address)!;
    const position = Position.load(vault.currentPosition!)!;
    position.tokenXAmount = position.tokenXAmount.plus(event.params.amountXIn);
    position.tokenYAmount = position.tokenYAmount.plus(event.params.amountYIn);
    position.save();

    updateUnderlyingBalancesAndLiquidty(vault);
}

/**
 * @dev Fired when liquidity is removed from the vault.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of LiquidityRemovedEvent.
 */
export function liquidityRemovedHandler(event: LiquidityRemovedEvent): void {
    const vault = Vault.load(event.address)!;
    const position = Position.load(vault.currentPosition!)!;
    position.tokenXWithdrawn = position.tokenXWithdrawn.plus(event.params.amountXOut);
    position.tokenYWithdrawn = position.tokenYWithdrawn.plus(event.params.amountYOut);
    position.priceSqrtAtClosing = IiZiSwapPool.bind(Address.fromBytes(vault.pool)).state().value0;
    if (position.closedAtBlock == ZERO) {
        position.closedAtTimestamp = event.block.timestamp;
        position.closedAtBlock = event.block.number;
    }
    position.save();

    updateUnderlyingBalancesAndLiquidty(Vault.load(event.address)!);
}

/**
 * @dev Called when vault shares are minted, burned or transferred. It updates the user's balance in a given
 * vault(event.address). The user's balance for a given vault is stored in the entity UserVaultBalance, the id
 * of which is being generated by concatenating the vault's id and user's address, so the data could structured
 * where users' data across different vaults could be tracked.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of TransferEvent.
 */
export function handleTransfer(event: TransferEvent): void {
    const vaultId = Bytes.fromByteArray(event.address);
    let tokenX = ZERO;
    let tokenY = ZERO;
    if (event.params.from != Address.zero()) {
        const fromVaultBalanceId = vaultId.concat(event.params.from);
        const fromVaultBalance = UserVaultBalance.load(fromVaultBalanceId)!;
        tokenX = fromVaultBalance.tokenX.minus(
            fromVaultBalance.tokenX
                .times(fromVaultBalance.balance.minus(event.params.value))
                .div(fromVaultBalance.balance)
        );

        tokenY = fromVaultBalance.tokenY.minus(
            fromVaultBalance.tokenY
                .times(fromVaultBalance.balance.minus(event.params.value))
                .div(fromVaultBalance.balance)
        );

        fromVaultBalance.balance = fromVaultBalance.balance.minus(event.params.value);
        fromVaultBalance.tokenX = fromVaultBalance.tokenX.minus(tokenX);
        fromVaultBalance.tokenY = fromVaultBalance.tokenY.minus(tokenY);
        fromVaultBalance.save();
    }

    if (event.params.to != Address.zero()) {
        let user = User.load(event.params.to);
        if (user == null) {
            user = new User((event.params.to));
            user.save();
        }

        const toVaultBalanceId = vaultId.concat(event.params.to);
        let toVaultBalance = UserVaultBalance.load(toVaultBalanceId);
        if (toVaultBalance == null) {
            toVaultBalance = new UserVaultBalance(toVaultBalanceId);
            toVaultBalance.address = event.params.to;
            toVaultBalance.balance = event.params.value;
            toVaultBalance.tokenX = ZERO;
            toVaultBalance.tokenY = ZERO;
            toVaultBalance.user = user.id;
            toVaultBalance.vault = vaultId;

            const vault = Vault.load(vaultId)!;
            vault.lastUserIndex = vault.lastUserIndex.plus(bn(1));
            vault.save();

            toVaultBalance.userIndex = vault.lastUserIndex;
        } else {
            toVaultBalance.balance = toVaultBalance.balance.plus(event.params.value);
        }

        if (event.params.from != Address.zero()) {
            toVaultBalance.tokenX = toVaultBalance.tokenX.plus(tokenX);
            toVaultBalance.tokenY = toVaultBalance.tokenY.plus(tokenY);
        }
        toVaultBalance.save();
    }

    updateUnderlyingBalancesAndLiquidty(Vault.load(vaultId)!);
}

/**
 * @dev Called when new ticks are set on the vault contract. It creates a new position entity instance based on the new position
 * created in the UNI-V3 pool.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of PointsSetEvent.
 */
export function handlePointsSet(event: PointsSetEvent): void {
    const vault = Vault.load(event.address)!;

    if (vault.currentPosition) {
        const lastPosition = Position.load(vault.currentPosition!)!;
        if (lastPosition.closedAtTimestamp == ZERO) {
            lastPosition.closedAtTimestamp = event.block.timestamp;
            lastPosition.closedAtBlock = event.block.number;
            lastPosition.save();
        }
    }

    vault.positionCount = vault.positionCount.plus(bn(1));
    const position = new Position(vault.id.toHexString() + "#" + vault.positionCount.toHexString().substr(2));
    position.tokenXAmount = ZERO;
    position.tokenYAmount = ZERO;
    position.tokenXWithdrawn = ZERO;
    position.tokenYWithdrawn = ZERO;
    position.lowerTick = bn(event.params.lowerTick);
    position.upperTick = bn(event.params.upperTick);
    position.feesEarned0 = ZERO;
    position.feesEarned1 = ZERO;
    position.vault = vault.id;
    position.openedAtTimestamp = event.block.timestamp;
    position.openedATBlock = event.block.number;
    position.closedAtTimestamp = ZERO;
    position.closedAtBlock = ZERO;
    position.priceSqrtAtOpening = IiZiSwapPool.bind(Address.fromBytes(vault.pool)).state().value0;
    position.priceSqrtAtClosing = ZERO;
    position.save();

    vault.currentPosition = position.id;
    vault.currentPositionIdInVault = RangeProtocolVault.bind(event.address).getPositionID();
    vault.save();
}

/**
 * @dev Called when manager or its fee are updated in a given vault(event.address). The manager or its fee
 * being updated are stored in the Vault store.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of ManagerFeeUpdatedEvent.
 */
export function feesUpdatedFeeHandler(event: FeeUpdatedEvent): void {
    const vault = Vault.load(event.address)!;
    vault.managingFee = bn(event.params.managingFee);
    vault.performanceFee = bn(event.params.performanceFee);
    vault.save();
}

/**
 * @dev Called when swap is performed on the vault by manager. It records the amount in
 * and amount out involved in the swap.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of SwappedEvent.
 */
export function handleSwap(event: SwappedEvent): void {
    const swap = new Swap(Bytes.fromHexString(event.block.timestamp.toHexString()));
    swap.zeroForOne = event.params.zeroForOne;
    swap.amountX = event.params.amountX;
    swap.amountY = event.params.amountY;
    swap.timestamp = event.block.timestamp;
    swap.vault = Vault.load(event.address)!.id
    swap.save();
    updateUnderlyingBalancesAndLiquidty(Vault.load(event.address)!);
}

/**
 * @dev Handles recording of fees accrued both in the current position and also the cumulative fees accrued across
 * all positions since vault creation.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of FeesEarnedEvent.
 */
export function handleFeesEarned(event: FeesEarnedEvent): void {
    const vault = Vault.load(event.address)!;

    vault.feeEarnedEventCount = vault.feeEarnedEventCount.plus(bn(1));
    const feeEarned = new FeeEarned(vault.id.toHexString() + "#" + vault.feeEarnedEventCount.toHexString().substr(2));
    feeEarned.amountX = event.params.feesEarned0;
    feeEarned.amountY = event.params.feesEarned1;
    feeEarned.timestamp = event.block.timestamp;
    feeEarned.vault = vault.id;
    feeEarned.save();

    const position = Position.load(vault.currentPosition!)!;
    position.feesEarned0 = position.feesEarned0.plus(event.params.feesEarned0);
    position.feesEarned1 = position.feesEarned1.plus(event.params.feesEarned1);
    position.save();

    vault.totalFeesEarned0 = vault.totalFeesEarned0.plus(event.params.feesEarned0);
    vault.totalFeesEarned1 = vault.totalFeesEarned1.plus(event.params.feesEarned1);
    vault.save();

    updateUnderlyingBalancesAndLiquidty(vault);
}

/**
 * @dev Handles recording of tracking vault's status if it in the position or out of the position with regards to
 * UNI-V3 pool.
 *
 * Updates the underlying balances and liquidity amount.
 *
 * @param event Instance of InThePositionStatusSetEvent.
 */
export function handleInThePositionStatusSet(event: InThePositionStatusSetEvent): void {
    const vault = Vault.load(event.address)!;
    vault.inThePosition = event.params.inThePosition;
    vault.save();
}

/**
 * @dev It updates the underlying balances of the vault on tokenX and tokenY.
 * The underlying balances include all the funds held by vault excluding the manager and treasury fees.
 *
 * It also updates the liquidity amount currently held by vault and finalize the vault's updates by saving in the updates
 * in subgraph store.
 *
 * @param vault Instance of vault of being updated.
 */
function updateUnderlyingBalancesAndLiquidty(vault: Vault): void {
    const vaultInstance = RangeProtocolVault.bind(Address.fromBytes(vault.id));
    vault.totalSupply = vaultInstance.totalSupply();

    const underlyingBalances = vaultInstance.try_getUnderlyingBalances();

    if (!underlyingBalances.reverted) {
        vault.balance0 = underlyingBalances.value.value0;
        vault.balance1 = underlyingBalances.value.value1;
    }

    vault.managerBalanceX = vaultInstance.managerBalanceX();
    vault.managerBalanceY = vaultInstance.managerBalanceY();
    const liquidity = IiZiSwapPool.bind(Address.fromBytes(vault.pool))
        .liquidity(vault.currentPositionIdInVault!).liquidity;

    vault.liquidity = liquidity;
    vault.save();
}

/**
 * @dev Constructs a unique id for mints and burn events based vault's address, user's address and current timestamp.
 * @param vaultAddr
 * @param userAddr
 * @param timestamp
 * @return An id created for mint/burn entity instance.
 */
function constructMintBurnId(vaultAddr: Bytes, userAddr: Bytes, timestamp: BigInt): Bytes {
    return vaultAddr
        .concat(userAddr)
        .concat(Bytes.fromHexString(timestamp.toHexString()));
}

