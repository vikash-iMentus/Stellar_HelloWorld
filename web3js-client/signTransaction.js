import dotenv from "dotenv";
//import StellarSdk from 'stellar-sdk';
import * as SorobanClient from "soroban-client";

dotenv.config()

const kp = SorobanClient.Keypair.random();
console.log(process.env.NETWORK_PASSPHRASE);

const tx = SorobanClient.TransactionBuilder.fromXDR("AAAAAgAAAAB3NsDXAc2LS8lfqGzr0QN60Y6iBc00C1w7ZUMrxf6AHAAAAGQAAAANAAAAAgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAAEAAAABAAAAAEAAAAEAAAAIDmLxiECVU0Bhvn7YJOCBBGAanaixxbDzfE8m/IQBi2oAAAABQAAAAVoZWxsbwAAAAAAAAUAAAAGdmlrYXNoAAAAAAAEAAAAAQAAAAIAAAAAAAAARQAAAAEAAAAGOYvGIQJVTQGG+ftgk4IEEYBqdqLHFsPN8Tyb8hAGLagAAAADAAAAAwAAAAAAAAAAAAAAAA==", process.env.NETWORK_PASSPHRASE);
console.log("Converted in trs obj:", tx);

const trs = tx.sign(kp);
console.log("This is signed trs:", trs);

console.log("Signed tx", tx.toXDR())