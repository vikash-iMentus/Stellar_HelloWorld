import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Address, Contract } from "soroban-client";
dotenv.config()
const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true }); // we call node as 


async function main() {
        console.log("RESPONSE:");
        const id = "dfe8f99e8a492cd9a8aa10b61ac9fcafad054d71b261749e6244ca01b1bea27e";
        let res =  await server.getTransactionStatus(id);
        console.log("result", res);
}

main();