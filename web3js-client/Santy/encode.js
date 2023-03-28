import * as SorobanClient from 'soroban-client'; // // import * as SorobanClient from "stellar-sdk"

export const encode = (val) => {
  switch (val.type) {
    case 'scvSymbol':
      return SorobanClient.xdr.ScVal.scvSymbol(val.value);
    case 'scoVec':
      return SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoVec([SorobanClient.xdr.ScVal.scvSymbol(val.value)]))
    case 'scvU32':
      return SorobanClient.xdr.ScVal.scvU32(val.value);
    case 'address':
      return new SorobanClient.Address(val.value).toScVal();
    case 'bytesn32':
      return SorobanClient.xdr.ScVal.scvObject(
        SorobanClient.xdr.ScObject.scoBytes(Buffer.from(val.value, 'hex'))
      );
    case 'scoU64':
      return SorobanClient.xdr.ScVal.scvObject(
        SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(val.value, val.value))
      );
    case 'scoU128':
      let u64 = new SorobanClient.xdr.Uint64(val.value, val.value);
      let u128 = new SorobanClient.xdr.Int128Parts({ lo: u64, hi: u64 });
      let scoU128 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU128(u128));
      return scoU128;
    case 'scoI128':
      let i64 = new SorobanClient.xdr.Uint64(val.value, val.value);
      let i128 = new SorobanClient.xdr.Int128Parts({ lo: i64, hi: i64 });
      let scoI128 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoI128(i128));
      return scoI128;

    default:
      break;
  }

  return SorobanClient.xdr.ScVal.scvSymbol(val.value);
};
