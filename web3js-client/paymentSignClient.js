// import sdk from "stellar-sdk";
import dotenv from "dotenv";
import StellarSdk from 'stellar-sdk';
import * as SorobanClient from "soroban-client"

dotenv.config()

const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

const tx = SorobanClient.TransactionBuilder.fromXDR("AAAAAgAAAAA5oQsn83P/VuTBFEO9zmqylZICuJqL7H7jdibHya/XaQAAAGQAAAGYAAAABgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAABSgDx4XSqYsYmdprVoYUBaz/VlweGrbsQGMOegHh3VawAAAAAAAAAAPWSNgAAAAAAAAAAA", process.env.NETWORK_PASSPHRASE);

//console.log("This is converted trx in object:", tx);

const trx = tx.sign(invokerKeypair);
//console.log("This is signed trs:", trx);

console.log('Transaction has been signed using invokerKeypair.');
// console.log("Signed tx", tx.toXDR())
const signedTx = await tx.toEnvelope().toXDR('base64')
console.log("Signed in xdr:", signedTx);

