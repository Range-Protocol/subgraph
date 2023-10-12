import {VaultCreated as VaultCreatedEvent} from "../generated/RangeProtocolFactory/RangeProtocolFactory";
import {RangeProtocolVault as RangeProtocolVaultTemplate} from "../generated/templates";
import {Vault} from "../generated/schema";
import {RangeProtocolVault} from "../generated/RangeProtocolFactory/RangeProtocolVault";
import {bn, ZERO} from "./common";
import {IERC20Metadata} from "../generated/RangeProtocolFactory/IERC20Metadata";
import {Bytes} from "@graphprotocol/graph-ts";

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
    vault.name = vaultInstance.name();
    vault.tokenX = vaultInstance.tokenX();
    vault.tokenY = vaultInstance.tokenY();
    vault.tokenXName = IERC20Metadata.bind(vaultInstance.tokenX()).name();
    vault.tokenYName = IERC20Metadata.bind(vaultInstance.tokenY()).name();
    vault.isPassive = !!vault.name.includes("Wide");
    vault.tag = !!vault.name.includes("Passive") || !!vault.name.includes("Wide")
        ? "Passive"
        : !!vault.name.includes("Pegged")
            || !!vault.name.toLowerCase().includes("weth/wsteth")
            || !!vault.name.toLowerCase().includes("wsteth/weth")
            || !!vault.name.toLowerCase().includes("usdc/usdt")
            || !!vault.name.toLowerCase().includes("usdt/usdc")
            ? "Pegged"
            : "Active";
    vault.liquidity = ZERO;
    vault.totalSupply = ZERO;

    vault.manager = vaultInstance.manager();
    vault.managingFee = bn(vaultInstance.managingFee());
    vault.performanceFee = bn(vaultInstance.performanceFee());
    vault.managerBalanceX = ZERO;
    vault.managerBalanceY = ZERO;

    vault.balance0 = ZERO;
    vault.balance1 = ZERO;

    vault.totalFeesEarned0 = ZERO;
    vault.totalFeesEarned1 = ZERO;
    vault.firstMintAtBlock = ZERO;
    vault.inThePosition = false;
    vault.currentPositionIdInVault = Bytes.fromHexString("0x");
    vault.positionCount = ZERO;
    vault.feeEarnedEventCount = ZERO;
    vault.lastUserIndex = ZERO;
    vault.save();

    // Start indexing newly deployed vault.
    RangeProtocolVaultTemplate.create(vaultAddress);
}
