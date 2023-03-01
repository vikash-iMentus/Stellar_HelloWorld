import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Contract } from "soroban-client";
dotenv.config()

export async function setHello(req, res) {
    const { srcAddress, name, number } = req.body;
    console.log("Name is::", name);
    console.log("Number is::", number);

    async function main() {

        const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

        const server = new SorobanClient.Server(process.env.SOROBAN_RPC_URL, { allowHttp: true }); // we call node as server here
        console.log("🚀 ~ file: helloServer.js ~ line 50 ~ main ~ server", server);

        const contract = new SorobanClient.Contract(process.env.CONTRACT_ID);
        //let { sequence } = await server.getAccount(invokerKeypair.publicKey())
        let { sequence } = await server.getAccount(`${srcAddress}`)
        console.log("🚀 ~ file: helloServer.js ~ line 56 ~ main ~ sequence", sequence.toString());

        let invokerAccount = new SorobanClient.Account(`${srcAddress}`, sequence.toString())
        console.log("🚀 ~ file: helloServer.js ~ line 59 ~ main ~ invokerAccount", invokerAccount);

        /********** WAY 02: Build the hello transaction with SorobanClient.Operation.invokeHostFunction **********/
        let method = "test_hello";
        let arg1 = SorobanClient.xdr.ScVal.scvSymbol(`${name}`);
        let arg2 = SorobanClient.xdr.ScVal.scvU32(number);
        let arr = [arg1, arg2];

        let hello_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
            fee: 100,
            networkPassphrase: process.env.NETWORK_PASSPHRASE,
            v1: true
        })
            .addOperation(contract.call(method, ...arr))
            .setTimeout(SorobanClient.TimeoutInfinite)
            .build();

        console.log("🚀 ~ file: helloServer.js ~ line 96 ~ main ~ build hello_transaction without footprint, only opts", hello_transaction);

        const inXdr = hello_transaction.toXDR();
        //let tras_xdr = transaction_with_footprint.toXDR();
        console.log("🚀 ~ file: helloServer.js ~ line 110 ~ main ~ transaction_with_footprint-:", inXdr);

        //await signTrx(tras_xdr);
        res.send(inXdr);

    }

    main();

}
