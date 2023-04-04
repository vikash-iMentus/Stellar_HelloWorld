import * as SorobanClient from 'soroban-client'; 
// // import * as SorobanClient from "stellar-sdk"
import { Address, Contract } from "soroban-client";


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
    case 'vecAddress':
      let ar_addr = [];
        let scAd;
        let addr;
        let strAddress= "";
        for (let i = 0; i < val.value.length; i++) {  
            strAddress = val.value[i].toString();
            console.log(typeof(strAddress));
            scAd = new Address(strAddress).toScAddress();
            addr = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoAddress(scAd));
            ar_addr.push(addr)
        }        
    let vecAddress =  SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoVec(ar_addr));
    return vecAddress

    default:
      break;
  }

  return SorobanClient.xdr.ScVal.scvSymbol(val.value);
};
