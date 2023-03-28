import * as XDR from 'js-xdr';
import * as SorobanClient from 'soroban-client'; // // import * as SorobanClient from "stellar-sdk"
import { decode } from './utilities/base64.js';
import * as Stellar from 'stellar-sdk'
import *as hex from './utilities/hex.js'

export const parse = (xdr, type=null) => {
  const parsed= parseRaw(xdr, type);
  return type ? { [type]: parsed } : parsed;
};
export const parseRaw = (xdr, parentType) => {
  // console.log('function start');
  if (xdr instanceof XDR.Struct) {
    // console.log('🚀 ~ parseRaw ~ XDR.Struct', XDR.Struct);
    // console.log('parseRaw if');
    const buffer = {};
    for (const attributeName in xdr._attributes) {
      buffer[attributeName] = parse(xdr._attributes[attributeName], null);
    }
    return buffer;
  } else if (xdr instanceof XDR.Union) {
    // console.log('🚀 ~ parseRaw ~ XDR.Union', XDR.Union);
    if (Number.isInteger(xdr._switch)) {
      // console.log('🚀 ~ parseRaw ~ xdr._switch', xdr._switch);
      return xdr._switch;
    } else if (xdr._value !== undefined) {
      const type = typeof xdr._arm === 'string' ? xdr._arm : null;
      return parse(xdr._value, type);
    } else {
      return parse(xdr._switch, null);
    }
  } else if (xdr instanceof XDR.Enum) {
    // console.log('🚀 ~ parseRaw ~ XDR.Enum', XDR.Enum);
    return xdr.name;
    return {
      [xdr.name]: parse(xdr.value, null),
    };
  } else if (xdr instanceof XDR.Hyper) {
    // console.log('🚀 ~ parseRaw ~ XDR.Hyper', XDR.Hyper);
    const number = (BigInt(xdr.high) << BigInt.asIntN(32, xdr.high)) | BigInt(xdr.low);

    if (number === BigInt(Number.parseInt(number.toString()))) {
      return Number.parseInt(number.toString());
    } else {
      return number;
    }
  } else if (xdr instanceof XDR.UnsignedHyper) {
    const number = (
      (BigInt(xdr.high) <<BigInt (32)) |
      (BigInt(xdr.low))
      );
      console.log("🚀 ~ parseRaw ~ BigInt(xdr.high)", BigInt(xdr.high))
      console.log("🚀 ~ parseRaw ~ BigInt (32)", BigInt (32))
    console.log("🚀 ~ parseRaw ~ number", number)

    if (number === BigInt(Number.parseInt(number.toString()))) {
      console.log("🚀 number === BigInt(Number.parseInt(number.toString()))", number === BigInt(Number.parseInt(number.toString())))
      console.log("🚀 ~ parseRaw ~ Number.parseInt(number.toString());", Number.parseInt(number.toString()))
      return Number.parseInt(number.toString());
    } else {
      console.log("🚀 ~esle parseRaw ~ number", number)
      
      return number;
    }
  } else if (Number.isInteger(xdr)) {
    console.log("number",Number.parseInt(xdr))
    return Number.parseInt(xdr);
  } else if (xdr instanceof Uint8Array) {
    console.log('🚀 ~ parseRaw ~ Uint8Array', Uint8Array);

    if (parentType === 'ed25519') {
      try {

        // const keys = new Keys(xdr);
        console.log("🚀 ~ parseRaw ~ return address",xdr)
        return xdr;
      } catch (error) {}
    }  else if (parentType === 'sym') {
      console.log('text');
      const symbol = new TextDecoder().decode(xdr);
      console.log('🚀 ~ parseRaw ~ symbol', symbol);

      return symbol;
    }
    console.log("hex encode xdr",xdr)
    console.log("🚀 ~ parseRaw ~ hex.encode(xdr)", hex.encode(xdr))
    return  hex.encode(xdr)
    } else if (xdr instanceof Array) {
    // console.log('🚀 ~ parseRaw261 ~ xdr', xdr);
    return xdr.map((xdr) => parse(xdr));
  } else {
    console.log(xdr, '264');
    return null;
  }
};



// function bigNumberFromBytes(signed: boolean, ...bytes: (string | number | bigint)[]): BigNumber {
//   let sign = 1;
//   if (signed && bytes[0] === 0x80) {
//     // top bit is set, negative number.
//     sign = -1;
//     bytes[0] &= 0x7f;
//   }
//   let b = BigInt(0);
//   for (let byte of bytes) {
//     b <<= BigInt(8);
//     b |= BigInt(byte);
//   }
//   return  BigNumber(b.toString()).multipliedBy(sign);

// }
// const formatAmount = (value: BigNumber, decimals = 7): string => {
//   return value.shiftedBy(decimals * -1).toNumber().toLocaleString()
// }

