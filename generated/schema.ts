// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Vault extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Vault entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Vault must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Vault", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Vault | null {
    return changetype<Vault | null>(store.get("Vault", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get pool(): Bytes {
    let value = this.get("pool");
    return value!.toBytes();
  }

  set pool(value: Bytes) {
    this.set("pool", Value.fromBytes(value));
  }

  get token0(): Bytes {
    let value = this.get("token0");
    return value!.toBytes();
  }

  set token0(value: Bytes) {
    this.set("token0", Value.fromBytes(value));
  }

  get token1(): Bytes {
    let value = this.get("token1");
    return value!.toBytes();
  }

  set token1(value: Bytes) {
    this.set("token1", Value.fromBytes(value));
  }

  get token0Name(): string {
    let value = this.get("token0Name");
    return value!.toString();
  }

  set token0Name(value: string) {
    this.set("token0Name", Value.fromString(value));
  }

  get token1Name(): string {
    let value = this.get("token1Name");
    return value!.toString();
  }

  set token1Name(value: string) {
    this.set("token1Name", Value.fromString(value));
  }

  get ticksLastUpdated(): BigInt {
    let value = this.get("ticksLastUpdated");
    return value!.toBigInt();
  }

  set ticksLastUpdated(value: BigInt) {
    this.set("ticksLastUpdated", Value.fromBigInt(value));
  }

  get liquidity(): BigInt {
    let value = this.get("liquidity");
    return value!.toBigInt();
  }

  set liquidity(value: BigInt) {
    this.set("liquidity", Value.fromBigInt(value));
  }

  get totalSupply(): BigInt {
    let value = this.get("totalSupply");
    return value!.toBigInt();
  }

  set totalSupply(value: BigInt) {
    this.set("totalSupply", Value.fromBigInt(value));
  }

  get manager(): Bytes {
    let value = this.get("manager");
    return value!.toBytes();
  }

  set manager(value: Bytes) {
    this.set("manager", Value.fromBytes(value));
  }

  get managerFee(): BigInt {
    let value = this.get("managerFee");
    return value!.toBigInt();
  }

  set managerFee(value: BigInt) {
    this.set("managerFee", Value.fromBigInt(value));
  }

  get managerBalance0(): BigInt {
    let value = this.get("managerBalance0");
    return value!.toBigInt();
  }

  set managerBalance0(value: BigInt) {
    this.set("managerBalance0", Value.fromBigInt(value));
  }

  get managerBalance1(): BigInt {
    let value = this.get("managerBalance1");
    return value!.toBigInt();
  }

  set managerBalance1(value: BigInt) {
    this.set("managerBalance1", Value.fromBigInt(value));
  }

  get treasury(): Bytes {
    let value = this.get("treasury");
    return value!.toBytes();
  }

  set treasury(value: Bytes) {
    this.set("treasury", Value.fromBytes(value));
  }

  get treasuryFee(): BigInt {
    let value = this.get("treasuryFee");
    return value!.toBigInt();
  }

  set treasuryFee(value: BigInt) {
    this.set("treasuryFee", Value.fromBigInt(value));
  }

  get treasuryBalance0(): BigInt {
    let value = this.get("treasuryBalance0");
    return value!.toBigInt();
  }

  set treasuryBalance0(value: BigInt) {
    this.set("treasuryBalance0", Value.fromBigInt(value));
  }

  get treasuryBalance1(): BigInt {
    let value = this.get("treasuryBalance1");
    return value!.toBigInt();
  }

  set treasuryBalance1(value: BigInt) {
    this.set("treasuryBalance1", Value.fromBigInt(value));
  }

  get balance0(): BigInt {
    let value = this.get("balance0");
    return value!.toBigInt();
  }

  set balance0(value: BigInt) {
    this.set("balance0", Value.fromBigInt(value));
  }

  get balance1(): BigInt {
    let value = this.get("balance1");
    return value!.toBigInt();
  }

  set balance1(value: BigInt) {
    this.set("balance1", Value.fromBigInt(value));
  }

  get totalFeesEarned0(): BigInt {
    let value = this.get("totalFeesEarned0");
    return value!.toBigInt();
  }

  set totalFeesEarned0(value: BigInt) {
    this.set("totalFeesEarned0", Value.fromBigInt(value));
  }

  get totalFeesEarned1(): BigInt {
    let value = this.get("totalFeesEarned1");
    return value!.toBigInt();
  }

  set totalFeesEarned1(value: BigInt) {
    this.set("totalFeesEarned1", Value.fromBigInt(value));
  }

  get inThePosition(): boolean {
    let value = this.get("inThePosition");
    return value!.toBoolean();
  }

  set inThePosition(value: boolean) {
    this.set("inThePosition", Value.fromBoolean(value));
  }

  get currentPosition(): Bytes {
    let value = this.get("currentPosition");
    return value!.toBytes();
  }

  set currentPosition(value: Bytes) {
    this.set("currentPosition", Value.fromBytes(value));
  }

  get positions(): Array<Bytes> {
    let value = this.get("positions");
    return value!.toBytesArray();
  }

  set positions(value: Array<Bytes>) {
    this.set("positions", Value.fromBytesArray(value));
  }
}

export class Position extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Position entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Position must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Position", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Position | null {
    return changetype<Position | null>(store.get("Position", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get lowerTick(): BigInt {
    let value = this.get("lowerTick");
    return value!.toBigInt();
  }

  set lowerTick(value: BigInt) {
    this.set("lowerTick", Value.fromBigInt(value));
  }

  get upperTick(): BigInt {
    let value = this.get("upperTick");
    return value!.toBigInt();
  }

  set upperTick(value: BigInt) {
    this.set("upperTick", Value.fromBigInt(value));
  }

  get feesEarned0(): BigInt {
    let value = this.get("feesEarned0");
    return value!.toBigInt();
  }

  set feesEarned0(value: BigInt) {
    this.set("feesEarned0", Value.fromBigInt(value));
  }

  get feesEarned1(): BigInt {
    let value = this.get("feesEarned1");
    return value!.toBigInt();
  }

  set feesEarned1(value: BigInt) {
    this.set("feesEarned1", Value.fromBigInt(value));
  }

  get vault(): Bytes {
    let value = this.get("vault");
    return value!.toBytes();
  }

  set vault(value: Bytes) {
    this.set("vault", Value.fromBytes(value));
  }
}

export class User extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save User entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type User must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("User", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): User | null {
    return changetype<User | null>(store.get("User", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get vaultBalances(): Array<Bytes> {
    let value = this.get("vaultBalances");
    return value!.toBytesArray();
  }

  set vaultBalances(value: Array<Bytes>) {
    this.set("vaultBalances", Value.fromBytesArray(value));
  }
}

export class UserVaultBalance extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save UserVaultBalance entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type UserVaultBalance must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("UserVaultBalance", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): UserVaultBalance | null {
    return changetype<UserVaultBalance | null>(
      store.get("UserVaultBalance", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get balance(): BigInt {
    let value = this.get("balance");
    return value!.toBigInt();
  }

  set balance(value: BigInt) {
    this.set("balance", Value.fromBigInt(value));
  }

  get vault(): Bytes {
    let value = this.get("vault");
    return value!.toBytes();
  }

  set vault(value: Bytes) {
    this.set("vault", Value.fromBytes(value));
  }

  get user(): Bytes {
    let value = this.get("user");
    return value!.toBytes();
  }

  set user(value: Bytes) {
    this.set("user", Value.fromBytes(value));
  }
}

export class Swap extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Swap entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Swap must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Swap", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Swap | null {
    return changetype<Swap | null>(store.get("Swap", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get zeroForOne(): boolean {
    let value = this.get("zeroForOne");
    return value!.toBoolean();
  }

  set zeroForOne(value: boolean) {
    this.set("zeroForOne", Value.fromBoolean(value));
  }

  get amount0(): BigInt {
    let value = this.get("amount0");
    return value!.toBigInt();
  }

  set amount0(value: BigInt) {
    this.set("amount0", Value.fromBigInt(value));
  }

  get amount1(): BigInt {
    let value = this.get("amount1");
    return value!.toBigInt();
  }

  set amount1(value: BigInt) {
    this.set("amount1", Value.fromBigInt(value));
  }
}

export class Mint extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Mint entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Mint must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Mint", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Mint | null {
    return changetype<Mint | null>(store.get("Mint", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get receiver(): Bytes {
    let value = this.get("receiver");
    return value!.toBytes();
  }

  set receiver(value: Bytes) {
    this.set("receiver", Value.fromBytes(value));
  }

  get mintAmount(): BigInt {
    let value = this.get("mintAmount");
    return value!.toBigInt();
  }

  set mintAmount(value: BigInt) {
    this.set("mintAmount", Value.fromBigInt(value));
  }

  get amount0In(): BigInt {
    let value = this.get("amount0In");
    return value!.toBigInt();
  }

  set amount0In(value: BigInt) {
    this.set("amount0In", Value.fromBigInt(value));
  }

  get amount1In(): BigInt {
    let value = this.get("amount1In");
    return value!.toBigInt();
  }

  set amount1In(value: BigInt) {
    this.set("amount1In", Value.fromBigInt(value));
  }
}

export class Burn extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Burn entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Burn must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Burn", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Burn | null {
    return changetype<Burn | null>(store.get("Burn", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get receiver(): Bytes {
    let value = this.get("receiver");
    return value!.toBytes();
  }

  set receiver(value: Bytes) {
    this.set("receiver", Value.fromBytes(value));
  }

  get burnAmount(): BigInt {
    let value = this.get("burnAmount");
    return value!.toBigInt();
  }

  set burnAmount(value: BigInt) {
    this.set("burnAmount", Value.fromBigInt(value));
  }

  get amount0Out(): BigInt {
    let value = this.get("amount0Out");
    return value!.toBigInt();
  }

  set amount0Out(value: BigInt) {
    this.set("amount0Out", Value.fromBigInt(value));
  }

  get amount1Out(): BigInt {
    let value = this.get("amount1Out");
    return value!.toBigInt();
  }

  set amount1Out(value: BigInt) {
    this.set("amount1Out", Value.fromBigInt(value));
  }
}
