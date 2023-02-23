import dotenv from "dotenv";
//import StellarSdk from 'stellar-sdk';
import * as SorobanClient from "soroban-client";

dotenv.config()

// const kp = SorobanClient.Keypair.random();
// console.log(process.env.NETWORK_PASSPHRASE);
const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

// Log the keypair details: Public and Secret Keys
//console.log(`Invoker Public Key: ${invokerKeypair.publicKey()}`);

const tx = SorobanClient.TransactionBuilder.fromXDR("AAAAAgAAAAA5oQsn83P/VuTBFEO9zmqylZICuJqL7H7jdibHya/XaQAAAGQAAAGYAAAABwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAAEAAAABAAAAAEAAAAEAAAAIHieJ0eGtgS/YSF4AvKhK+TaNiYTylHKD1nEMGjKinbKAAAABQAAAAVoZWxsbwAAAAAAAAUAAAAGdmlrYXNoAAAAAAAEAAAAAQAAAAIAAAAAAAAACwAAAAEAAAAGeJ4nR4a2BL9hIXgC8qEr5No2JhPKUcoPWcQwaMqKdsoAAAADAAAAAwAAAAAAAAAAAAAAAA==", process.env.NETWORK_PASSPHRASE);
console.log("Converted in trs obj:", tx);

const trs = tx.sign(invokerKeypair);
//console.log("This is signed trs:", trs);

console.log("Signed tx", tx.toXDR())