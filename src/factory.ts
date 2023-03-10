import {VaultCreated as VaultCreatedEvent} from "../generated/RangeProtocolFactory/RangeProtocolFactory";
import {RangeProtocolVault as RangeProtocolVaultTemplate} from "../generated/templates";
import {Position, Vault} from "../generated/schema";
import {RangeProtocolVault} from "../generated/RangeProtocolFactory/RangeProtocolVault";
import {bn, ZERO} from "./common";

/**
 * @dev Called when a new vault is created through Factory. The handler spins a new template
 * for the Vault to start the newly created vault's indexing.
 * The initial state of the Vault's store is also set in addition to creating a new Position instance.
 *
 * @param event Instance of VaultCreatedEvent.
 */
export function handleVaultCreated(event: VaultCreatedEvent): void {
    const vaultAddress = event.params.vault;
    let vault = new Vault(vaultAddress);
    vault.pool = event.params.uniPool;

    const vaultInstance = RangeProtocolVault.bind(vaultAddress);
    vault.token0 = vaultInstance.token0();
    vault.token1 = vaultInstance.token1();
    vault.ticksLastUpdated = event.block.timestamp;
    vault.liquidity = ZERO;
    vault.totalSupply = ZERO;

    vault.manager = vaultInstance.manager();
    vault.managerFee = bn(vaultInstance.treasuryFee());
    vault.managerBalance0 = ZERO;
    vault.managerBalance1 = ZERO;

    vault.treasury = vaultInstance.treasury();
    vault.treasuryFee = bn(vaultInstance.treasuryFee());
    vault.treasuryBalance0 = ZERO;
    vault.treasuryBalance1 = ZERO;

    vault.balance0 = ZERO;
    vault.balance1 = ZERO;

    vault.totalFeesEarned0 = ZERO;
    vault.totalFeesEarned1 = ZERO;
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
