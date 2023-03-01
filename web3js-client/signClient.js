import dotenv from "dotenv";
//import StellarSdk from 'stellar-sdk';
import * as SorobanClient from "soroban-client";

dotenv.config()

const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

const tx = SorobanClient.TransactionBuilder.fromXDR("AAAAAgAAAAD6F41mIP5FgS3o/pl1xQrVs8/BL14clmUwy9PNWJkj2gAAAGQAAp7aAAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAAEAAAABAAAAAEAAAAGAAAAIHX6UKvD7qWgBsDlLi/dnUwBHrEsX+q/Rwt/7zAtsIctAAAABQAAAAp0ZXN0X2hlbGxvAAAAAAAFAAAAA0pheQAAAAABAAAAAgAAAAEAAAAGdfpQq8PupaAGwOUuL92dTAEesSxf6r9HC3/vMC2why0AAAADAAAAAwAAAAAAAAAAAAAAAAAAAAA=", process.env.NETWORK_PASSPHRASE);
console.log("Converted in trs obj:", tx);

const trs = tx.sign(invokerKeypair);
//console.log("This is signed trs:", trs);

console.log("Signed tx", tx.toXDR())