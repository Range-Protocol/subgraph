import {
    Burn,
    Mint,
    Position,
    Swap,
    User,
    UserVaultBalance,
    Vault,
    FeeEarned,
    CollateralSupplied,
    CollateralWithdrawn,
    GHOMinted,
    GHOBurned,
    PoolRepeg
} from "../generated/schema";
import {Address, BigInt, Bytes, store} from "@graphprotocol/graph-ts";
import {
    Minted as MintedEvent,
    Burned as BurnedEvent,
    Transfer as TransferEvent,
    TicksSet as TicksSetEvent,
    LiquidityAdded as LiquidityAddedEvent,
    LiquidityRemoved as LiquidityRemovedEvent,
    FeesUpdated as FeeUpdatedEvent,
    Swapped as SwappedEvent,
    FeesEarned as FeesEarnedEvent,
    InThePositionStatusSet as InThePositionStatusSetEvent,
    CollateralSupplied as CollateralSuppliedEvent,
    CollateralWithdrawn as CollateralWithdrawnEvent,
    GHOMinted as GHOMintedEvent,
    GHOBurned as GHOBurnedEvent,
    PoolRepegged as PoolRepeggedEvent,
    RangeProtocolVault
} from "../generated/RangeProtocolFactory/RangeProtocolVault";
import {bn, ZERO} from "./common";
import {IUniswapV3Pool} from "../generated/RangeProtocolFactory/IUniswapV3Pool";

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
    mint.mintAmount = event.params.shares;
    mint.amountIn = event.params.amount;
    mint.timestamp = event.block.timestamp;
    mint.vault = vault.id;
    mint.save();

    const vaultId = Bytes.fromByteArray(event.address);
    const userVaultBalance = UserVaultBalance.load(vaultId.concat(event.params.receiver))!;
    userVaultBalance.token = userVaultBalance.token.plus(event.params.amount);
    userVaultBalance.save();

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
    burn.amountOut = event.params.amount;
    burn.timestamp = event.block.timestamp;
    burn.vault = Vault.load(event.address)!.id
    burn.save();

    const vault = Vault.load(event.address)!;
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
    const vaultInstance = RangeProtocolVault.bind(Address.fromBytes(event.address));
    vault.positionCount = vault.positionCount.plus(bn(1));
    const position = new Position(vault.id.toHexString() + "#" + vault.positionCount.toHexString().substr(2));
    position.token0Amount = event.params.amount0In;
    position.token1Amount = event.params.amount1In;
    position.token0Withdrawn = ZERO;
    position.token1Withdrawn = ZERO;
    position.lowerTick = bn(vaultInstance.lowerTick());
    position.upperTick = bn(vaultInstance.upperTick());
    position.feesEarned0 = ZERO;
    position.feesEarned1 = ZERO;
    position.vault = vault.id;
    position.openedAtTimestamp = event.block.timestamp;
    position.openedATBlock = event.block.number;
    position.closedAtTimestamp = ZERO;
    position.closedAtBlock = ZERO;
    position.priceSqrtAtOpening = IUniswapV3Pool.bind(Address.fromBytes(vault.pool)).slot0().value0;
    position.priceSqrtAtClosing = ZERO;
    position.save();

    vault.currentPosition = position.id;
    vault.currentPositionIdInVault = RangeProtocolVault.bind(event.address).getPositionID();
    vault.save();

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
    position.token0Withdrawn = position.token0Withdrawn.plus(event.params.amount0Out);
    position.token1Withdrawn = position.token1Withdrawn.plus(event.params.amount1Out);
    position.priceSqrtAtClosing = IUniswapV3Pool.bind(Address.fromBytes(vault.pool)).slot0().value0;
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
    let token = ZERO;
    if (event.params.from != Address.zero()) {
        const fromVaultBalanceId = vaultId.concat(event.params.from);
        const fromVaultBalance = UserVaultBalance.load(fromVaultBalanceId)!;
        token = fromVaultBalance.token.minus(
            fromVaultBalance.token
                .times(fromVaultBalance.balance.minus(event.params.value))
                .div(fromVaultBalance.balance)
        );

        fromVaultBalance.balance = fromVaultBalance.balance.minus(event.params.value);
        fromVaultBalance.token = fromVaultBalance.token.minus(token);
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
            toVaultBalance.token = ZERO;
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
            toVaultBalance.token = toVaultBalance.token.plus(token);
        }
        toVaultBalance.save();
    }

    updateUnderlyingBalancesAndLiquidty(Vault.load(vaultId)!);
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
    swap.amount0 = event.params.amount0;
    swap.amount1 = event.params.amount1;
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
    feeEarned.amount0 = event.params.feesEarned0;
    feeEarned.amount1 = event.params.feesEarned1;
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

export function handleCollateralSupplied(event: CollateralSuppliedEvent): void {
    const vault = Vault.load(event.address)!;
    vault.collateralSuppliedCount = vault.collateralSuppliedCount.plus(bn(1));
    vault.save();
    const collateralSupplied = new CollateralSupplied(vault.id.toHexString() + "#" + vault.collateralSuppliedCount.toHexString().substr(2));
    collateralSupplied.collateralToken = vault.token1;
    collateralSupplied.amountSupplied = event.params.amount;
    collateralSupplied.timestamp = event.block.timestamp;
    collateralSupplied.vault = vault.id;
    collateralSupplied.save();

}

export function handleCollateralWithdrawn(event: CollateralWithdrawnEvent): void {
    const vault = Vault.load(event.address)!;
    vault.collateralWithdrawnCount = vault.collateralWithdrawnCount.plus(bn(1));
    vault.save();
    const collateralWithdrawn = new CollateralWithdrawn(vault.id.toHexString() + "#" + vault.collateralWithdrawnCount.toHexString().substr(2));
    collateralWithdrawn.collateralToken = vault.token1;
    collateralWithdrawn.amountWithdrawn = event.params.amount;
    collateralWithdrawn.timestamp = event.block.timestamp;
    collateralWithdrawn.vault = vault.id;
    collateralWithdrawn.save();
}

export function handleGHOMinted(event: GHOMintedEvent): void {
    const vault = Vault.load(event.address)!;
    vault.ghoMintedCount = vault.ghoMintedCount.plus(bn(1));
    vault.save();
    const ghoMinted = new GHOMinted(vault.id.toHexString() + "#" + vault.ghoMintedCount.toHexString().substr(2));
    ghoMinted.collateralToken = vault.token1;
    ghoMinted.amountMinted = event.params.amount;
    ghoMinted.timestamp = event.block.timestamp;
    ghoMinted.vault = vault.id;
    ghoMinted.save();
}

export function handleGHOBurned(event: GHOBurnedEvent): void {
    const vault = Vault.load(event.address)!;
    vault.ghoBurnedCount = vault.ghoBurnedCount.plus(bn(1));
    vault.save();
    const ghoBurned = new GHOBurned(vault.id.toHexString() + "#" + vault.ghoBurnedCount.toHexString().substr(2));
    ghoBurned.collateralToken = vault.token1;
    ghoBurned.amountBurned = event.params.amount;
    ghoBurned.timestamp = event.block.timestamp;
    ghoBurned.vault = vault.id;
    ghoBurned.save();
}

export function handlePoolRepegged(event: PoolRepeggedEvent): void {
    const vault = Vault.load(event.address)!;
    vault.poolRepegdCount = vault.poolRepegdCount.plus(bn(1));
    vault.save();
    const poolRepeg = new PoolRepeg(vault.id.toHexString() + "#" + vault.poolRepegdCount.toHexString().substr(2));
    poolRepeg.timestamp = event.block.timestamp;
    poolRepeg.vault = vault.id;
    poolRepeg.save();
}

/**
 * @dev It updates the underlying balances of the vault on token0 and token1.
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
    vault.balance = vaultInstance.getBalanceInCollateralToken();
    vault.managerBalance = vaultInstance.managerBalance();
    if (vaultInstance.inThePosition()) {
        const position = IUniswapV3Pool.bind(Address.fromBytes(vault.pool))
            .positions(vault.currentPositionIdInVault!);

        // vault.liquidity = position.value0;
    }

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

