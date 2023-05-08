import {BigInt} from "@graphprotocol/graph-ts";

export const bn = (x: i64): BigInt => BigInt.fromI64(x)
export const ZERO = bn(0);