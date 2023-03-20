import dotenv from "dotenv";
//import StellarSdk from 'stellar-sdk';
import * as SorobanClient from "soroban-client";

dotenv.config()
console.log("Config readed");

console.log(process.env.PRIVATE_KEY_INVOKER);
const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);
let str = "AAAAAgAAAADRwOwTLThAnnLkCD9FveSsCLp+5gQVr+JfdY5Yc4L2vQAAAGQAA62OAAAAAgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAADAAAABAAAAAEAAAAGAAAAIAteSfAVgW/eDkWrIAwzY4oLDaVFJ7B6PTsSerrv4+stAAAABQAAAAZ3b3JsZDQAAAAAAAQAAAABAAAAAgAAAAAAAAAnAAAAAQAAAAYLXknwFYFv3g5FqyAMM2OKCw2lRSewej07Enq67+PrLQAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAA==";
console.log("read str");

const tx = SorobanClient.TransactionBuilder.fromXDR(str, process.env.NETWORK_PASSPHRASE);
console.log("Converted in trs obj:", tx);

const trs = tx.sign(invokerKeypair);
//console.log("This is signed trs:", trs);

console.log("Signed tx", tx.toXDR());

