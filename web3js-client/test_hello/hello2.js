import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Address, Contract } from "soroban-client";
dotenv.config()

export async function Hello2(req, res) {
    const { to, param2, srcAddress } = req.body;

    async function main() {

        const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);
        // let pkey = new Address(invokerAddr).toScVal();

        let contractIdObj = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(Buffer.from("0aab175ed995e17d75ea2d305f9396ff2b0410fb6c0390e37ab84ecf8282a5ec", 'hex')));
        //console.log("This is contractId:", contractIdObj);

        const server = new SorobanClient.Server(process.env.SOROBAN_RPC_URL, { allowHttp: true }); // we call node as server here
        // console.log("🚀 ~ file: helloServer.js ~ line 50 ~ main ~ server", server);

        const contract = new SorobanClient.Contract(process.env.CONTRACT_ID);
        //let { sequence } = await server.getAccount(invokerKeypair.publicKey())
        let { sequence } = await server.getAccount(srcAddress)

        let invokerAccount = new SorobanClient.Account(`${srcAddress}`, sequence.toString())
        // console.log("🚀 ~ file: helloServer.js ~ line 59 ~ main ~ invokerAccount", invokerAccount);

        /********** WAY 02: Build the hello transaction with SorobanClient.Operation.invokeHostFunction **********/


        let method = "test_hello";
        // let arg1 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScAddress.scAddressTypeAccount(publicKey))
        //let arg1 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoAddress(publicKey));
        let arg1 = new SorobanClient.xdr.ScVal.scvSymbol(to);
        console.log("This is arg1 addr:", typeof (arg1));
        console.log("VALUE: ", arg1._value);

        let arg2 = SorobanClient.xdr.ScVal.scvU32(param2);
        console.log("This is arg5 val:", typeof (arg2));
        console.log("VALUE: ", arg2._value);
        let arg5 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(Buffer.from("0aab175ed995e17d75ea2d305f9396ff2b0410fb6c0390e37ab84ecf8282a5ec", 'hex')));
        console.log("This is arg5 val:", arg5);
        // let arg6 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(wasmHash));
        // console.log("This is arg6 val:", arg6);
        let arr = [arg1, arg2, arg5];

        // let hello_transaction_argument = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScVal.scvSymbol('World'))
        // let contractIdObj = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(Buffer.from(process.env.CONTRACT_ID, 'hex')));

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

        // await signTrx(tras_xdr);
        res.send(inXdr);

    }

    main();

}