import dotenv from "dotenv";
//import StellarSdk from 'stellar-sdk';
import * as SorobanClient from "soroban-client";

dotenv.config()
console.log("Config readed");

console.log(process.env.PRIVATE_KEY_INVOKER);
const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);
let str = "AAAAAgAAAAC5bVrGBXKZ544041pZ238qIysxpLdY3fdEbuCt8ntiTAAAAGQABGLDAAAACAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAAHAAAABAAAAAEAAAAGAAAAIJwgcugPNuWIlkKjryqFQvwM387INMWZtaPdMJ4DeGs5AAAABQAAAAl2YXVsdF9yZXEAAAAAAAAEAAAAAQAAAAgAAAAAAAAAAI3gZGWLFwdeBmFfXnO/Vm7w81Wap02SAF9ZgM8jcQ3NAAAAAQAAASwAAAABAAAADAAAAAEAAAAMAAAABAAAAAEAAAAGAAAAIAqrF17ZleF9deotMF+Tlv8rBBD7bAOQ43q4Ts+CgqXsAAAAAQAAAAacIHLoDzbliJZCo68qhUL8DN/OyDTFmbWj3TCeA3hrOQAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAA==";
console.log("read str");

const tx = SorobanClient.TransactionBuilder.fromXDR(str, process.env.NETWORK_PASSPHRASE);
console.log("Converted in trs obj:", tx);

const trs = tx.sign(invokerKeypair);
//console.log("This is signed trs:", trs);

console.log("Signed tx", tx.toXDR());


