import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Address, Contract } from "soroban-client";
dotenv.config()
const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true }); // we call node as 


async function main() {
    let srcAddress = "GDI4B3ATFU4EBHTS4QED6RN54SWAROT64YCBLL7CL52Y4WDTQL3L24WT";
    let p1 = 39;

    const contract = new SorobanClient.Contract(process.env.CONTRACT_ID);
    //let { sequence } = await server.getAccount(invokerKeypair.publicKey())
    let { sequence } = await server.getAccount(srcAddress)

    let invokerAccount = new SorobanClient.Account(`${srcAddress}`, sequence.toString())
    // console.log("🚀 ~ file: helloServer.js ~ line 59 ~ main ~ invokerAccount", invokerAccount);

    /********** WAY 02: Build the hello transaction with SorobanClient.Operation.invokeHostFunction **********/


    let method = "world4";

    // U64
    // let low = new SorobanClient.xdr.Uint64(amount);
    let arg1 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(p1)));
    // let arg4 = SorobanClient.xdr.ScVal.scvObject.scoU64(new SorobanClient.xdr.Uint64(p4));
    console.log("This is arg4 addr:", typeof (arg1));
    console.log("VALUE: ", arg1._value)

    // Array
    let arr = [arg1];

    // let hello_transaction_argument = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScVal.scvSymbol('World'))
    // let contractIdObj = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(Buffer.from(process.env.CONTRACT_ID, 'hex')));

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
    const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

    const tx = SorobanClient.TransactionBuilder.fromXDR(inXdr, process.env.NETWORK_PASSPHRASE);
    console.log("Converted in trs obj:", tx);

    const trs = tx.sign(invokerKeypair);
    console.log("SIGNED");
    let response = await server.sendTransaction(tx); //Soroban server do not have a submitTransaction endpoint
    console.log("SEND Response: ", response.status);
    let res = await server.getTransactionStatus(response.id);
    console.log("result", res);
}

main();