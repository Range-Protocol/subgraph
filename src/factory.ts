import {VaultCreated as VaultCreatedEvent} from "../generated/RangeProtocolFactory/RangeProtocolFactory";
import {RangeProtocolVault as RangeProtocolVaultTemplate} from "../generated/templates";
import {Position, Vault} from "../generated/schema";
import {RangeProtocolVault} from "../generated/RangeProtocolFactory/RangeProtocolVault";
import {bn, ZERO} from "./common";
import {IERC20Metadata} from "../generated/RangeProtocolFactory/IERC20Metadata";
import {Address} from "@graphprotocol/graph-ts";

/**
 * @dev Called when a new vault is created through Factory. The handler spins a new template
 * for the Vault to start the newly created vault's indexing.
 * The initial state of the Vault's store is also set in addition to creating a new Position instance.
 *
 * @param event Instance of VaultCreatedEvent.
 */
export function handleVaultCreated(event: VaultCreatedEvent): void {
    const vaultAddress = event.params.vault;

    if (
        vaultAddress == Address.fromString("0x510982F346cF8083FE935080cD61a78E2E7E8fd1")
        || vaultAddress == Address.fromString("0x08683236338c9df817330F6e4dBB818cD8155616")
    ) {
        let vault = new Vault(vaultAddress);
        vault.pool = event.params.uniPool;

        const vaultInstance = RangeProtocolVault.bind(vaultAddress);
        vault.token0 = vaultInstance.token0();
        vault.token1 = vaultInstance.token1();
        vault.token0Name = IERC20Metadata.bind(vaultInstance.token0()).name();
        vault.token1Name = IERC20Metadata.bind(vaultInstance.token1()).name();
        vault.ticksLastUpdated = event.block.timestamp;
        vault.liquidity = ZERO;
        vault.totalSupply = ZERO;

        vault.manager = vaultInstance.manager();
        vault.managerFee = bn(vaultInstance.managerFee());
        vault.managerBalance0 = ZERO;
        vault.managerBalance1 = ZERO;

        vault.treasury = vaultInstance.treasury();
        vault.treasuryFee = bn(vaultInstance.TREASURY_FEE_BPS());
        vault.treasuryBalance0 = ZERO;
        vault.treasuryBalance1 = ZERO;

        vault.balance0 = ZERO;
        vault.balance1 = ZERO;

        vault.totalFeesEarned0 = ZERO;
        vault.totalFeesEarned1 = ZERO;
        vault.firstMintAtBlock = ZERO;
        vault.inThePosition = true;

        const lowerTick = bn(vaultInstance.lowerTick());
        const upperTick = bn(vaultInstance.upperTick());

        const position = new Position(vaultInstance.getPositionID());
        position.lowerTick = lowerTick;
        position.upperTick = upperTick;
        position.feesEarned0 = ZERO;
        position.feesEarned1 = ZERO;
        position.vault = vault.id;
        position.save();

        vault.currentPosition = position.id;
        vault.save();

        // Start indexing newly deployed vault.
        RangeProtocolVaultTemplate.create(vaultAddress);
    }
}
