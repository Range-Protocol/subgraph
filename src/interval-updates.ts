import {VaultDayData, VaultHourData} from "../generated/schema";
import {BigInt, ethereum} from "@graphprotocol/graph-ts";
import {ZERO} from "./common";

export function updateVaultDayData(
    event: ethereum.Event,
    fee0: BigInt,
    fee1: BigInt
): void {
    const timestamp = event.block.timestamp.toI32()
    const dayID = timestamp / 86400
    const dayStartTimestamp = dayID * 86400
    const vaultDayID = event.address
        .toHexString()
        .concat('-')
        .concat(dayID.toString());

    let vaultDayData = VaultDayData.load(vaultDayID);
    if (vaultDayData == null) {
        vaultDayData = new VaultDayData(vaultDayID);
        vaultDayData.date = dayStartTimestamp;
        vaultDayData.vault = event.address;
        vaultDayData.fee0 = ZERO;
        vaultDayData.fee1 = ZERO;
    }
    vaultDayData.fee0 = vaultDayData.fee0.plus(fee0);
    vaultDayData.fee1 = vaultDayData.fee1.plus(fee1);
    vaultDayData.save();
}

export function updateVaultHourData(
    event: ethereum.Event,
    fee0: BigInt,
    fee1: BigInt
): void {
    const timestamp = event.block.timestamp.toI32()
    const hourIndex = timestamp / 3600 // get unique hour within unix history
    const hourStartUnix = hourIndex * 3600 // want the rounded effect
    const vaultHourID = event.address
        .toHexString()
        .concat('-')
        .concat(hourIndex.toString())

    let vaultHourData = VaultHourData.load(vaultHourID);
    if (vaultHourData == null) {
        vaultHourData = new VaultHourData(vaultHourID);
        vaultHourData.periodStartUnix = hourStartUnix;
        vaultHourData.vault = event.address;
        vaultHourData.fee0 = ZERO;
        vaultHourData.fee1 = ZERO;
    }
    vaultHourData.fee0 = vaultHourData.fee0.plus(fee0);
    vaultHourData.fee1 = vaultHourData.fee1.plus(fee1);
    vaultHourData.save();
}