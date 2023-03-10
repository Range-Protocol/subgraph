import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  Burned,
  FeesEarned,
  Minted,
  OwnershipTransferred,
  Transfer,
  UpdateManagerParams
} from "../generated/RangeProtocolVault/RangeProtocolVault"

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createBurnedEvent(
  receiver: Address,
  burnAmount: BigInt,
  amount0Out: BigInt,
  amount1Out: BigInt,
  liquidityBurned: BigInt
): Burned {
  let burnedEvent = changetype<Burned>(newMockEvent())

  burnedEvent.parameters = new Array()

  burnedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  burnedEvent.parameters.push(
    new ethereum.EventParam(
      "burnAmount",
      ethereum.Value.fromUnsignedBigInt(burnAmount)
    )
  )
  burnedEvent.parameters.push(
    new ethereum.EventParam(
      "amount0Out",
      ethereum.Value.fromUnsignedBigInt(amount0Out)
    )
  )
  burnedEvent.parameters.push(
    new ethereum.EventParam(
      "amount1Out",
      ethereum.Value.fromUnsignedBigInt(amount1Out)
    )
  )
  burnedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidityBurned",
      ethereum.Value.fromUnsignedBigInt(liquidityBurned)
    )
  )

  return burnedEvent
}

export function createFeesEarnedEvent(
  feesEarned0: BigInt,
  feesEarned1: BigInt
): FeesEarned {
  let feesEarnedEvent = changetype<FeesEarned>(newMockEvent())

  feesEarnedEvent.parameters = new Array()

  feesEarnedEvent.parameters.push(
    new ethereum.EventParam(
      "feesEarned0",
      ethereum.Value.fromUnsignedBigInt(feesEarned0)
    )
  )
  feesEarnedEvent.parameters.push(
    new ethereum.EventParam(
      "feesEarned1",
      ethereum.Value.fromUnsignedBigInt(feesEarned1)
    )
  )

  return feesEarnedEvent
}

export function createMintedEvent(
  receiver: Address,
  mintAmount: BigInt,
  amount0In: BigInt,
  amount1In: BigInt,
  liquidityMinted: BigInt
): Minted {
  let mintedEvent = changetype<Minted>(newMockEvent())

  mintedEvent.parameters = new Array()

  mintedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  mintedEvent.parameters.push(
    new ethereum.EventParam(
      "mintAmount",
      ethereum.Value.fromUnsignedBigInt(mintAmount)
    )
  )
  mintedEvent.parameters.push(
    new ethereum.EventParam(
      "amount0In",
      ethereum.Value.fromUnsignedBigInt(amount0In)
    )
  )
  mintedEvent.parameters.push(
    new ethereum.EventParam(
      "amount1In",
      ethereum.Value.fromUnsignedBigInt(amount1In)
    )
  )
  mintedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidityMinted",
      ethereum.Value.fromUnsignedBigInt(liquidityMinted)
    )
  )

  return mintedEvent
}

export function createOwnershipTransferredEvent(
  previousManager: Address,
  newManager: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousManager",
      ethereum.Value.fromAddress(previousManager)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "newManager",
      ethereum.Value.fromAddress(newManager)
    )
  )

  return ownershipTransferredEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}

export function createUpdateManagerParamsEvent(
  managerFeeBPS: i32,
  managerTreasury: Address
): UpdateManagerParams {
  let updateManagerParamsEvent = changetype<UpdateManagerParams>(newMockEvent())

  updateManagerParamsEvent.parameters = new Array()

  updateManagerParamsEvent.parameters.push(
    new ethereum.EventParam(
      "managerFeeBPS",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(managerFeeBPS))
    )
  )
  updateManagerParamsEvent.parameters.push(
    new ethereum.EventParam(
      "managerTreasury",
      ethereum.Value.fromAddress(managerTreasury)
    )
  )

  return updateManagerParamsEvent
}
