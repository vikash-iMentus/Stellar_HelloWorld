// import sdk from "stellar-sdk";
import dotenv from "dotenv";
import StellarSdk from 'stellar-sdk';
import * as SorobanClient from "soroban-client"

dotenv.config()

const kp = StellarSdk.Keypair.random();
console.log(process.env.NETWORK_PASSPHRASE);

const tx = StellarSdk.TransactionBuilder.fromXDR("AAAAAgAAAABUI318J6Rg5zdlxxulCdkTiatzLB7arbqcBY3JEkS75gAAAGQAAAAQAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAk4TTtavBWsGnEN3KxHw4Ohwi22ZJHWi8hlamN5pm0TgAAAAAAAAAANQxSgAAAAAAAAAAA", process.env.NETWORK_PASSPHRASE);

console.log("This is converted trx in object:", tx);

const trx = tx.sign(kp);
//console.log("This is signed trs:", trx);

console.log('Transaction has been signed using invokerKeypair.');
// console.log("Signed tx", tx.toXDR())
const signedTx = await tx.toEnvelope().toXDR('base64')
console.log("Signed in xdr:", signedTx);


