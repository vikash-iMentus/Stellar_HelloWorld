import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Address, Contract } from "soroban-client";
dotenv.config()

export async function World(req, res) {
    const { p1, srcAddress } = req.body;

    async function main() {

        const server = new SorobanClient.Server(process.env.SOROBAN_RPC_URL, { allowHttp: true }); // we call node as server here

        const contract = new SorobanClient.Contract(process.env.CONTRACT_ID);
        //let { sequence } = await server.getAccount(invokerKeypair.publicKey())
        let { sequence } = await server.getAccount(srcAddress)

        let invokerAccount = new SorobanClient.Account(`${srcAddress}`, sequence.toString())
        // console.log("🚀 ~ file: helloServer.js ~ line 59 ~ main ~ invokerAccount", invokerAccount);

        /********** WAY 02: Build the hello transaction with SorobanClient.Operation.invokeHostFunction **********/
        

        let method = "world4";
        let arg1 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(p1)));
        let arr = [arg1];

        let hello1_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
            fee: 100,
            networkPassphrase: process.env.NETWORK_PASSPHRASE,
            v1: true
        })
            .addOperation(contract.call(method, ...arr))
            .setTimeout(SorobanClient.TimeoutInfinite)
            .build();

        console.log("🚀 ~ file: helloServer.js ~ line 96 ~ main ~ build hello_transaction without footprint, only opts", hello1_transaction);

        const inXdr = hello1_transaction.toXDR();
        //let tras_xdr = transaction_with_footprint.toXDR();
        console.log("🚀 ~ file: helloServer.js ~ line 110 ~ main ~ transaction_with_footprint-:", inXdr);

        // await signTrx(tras_xdr);
        res.send(inXdr);

    }

    main();

}