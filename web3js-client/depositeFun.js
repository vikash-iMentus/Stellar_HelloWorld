import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Address, Contract } from "soroban-client";
dotenv.config()

export async function depFun(req, res) {
    const { invoker, amount, unique_id, srcAddress} = req.body;

    async function main() {

        const server = new SorobanClient.Server(process.env.SOROBAN_RPC_URL, { allowHttp: true }); // we call node as server here
        // console.log("🚀 ~ file: helloServer.js ~ line 50 ~ main ~ server", server);

        const contract = new SorobanClient.Contract(process.env.CONTRACT_ID);
        //let { sequence } = await server.getAccount(invokerKeypair.publicKey())
        let { sequence } = await server.getAccount(srcAddress)

        let invokerAccount = new SorobanClient.Account(`${srcAddress}`, sequence.toString())
        // console.log("🚀 ~ file: helloServer.js ~ line 59 ~ main ~ invokerAccount", invokerAccount);

        /********** WAY 02: Build the hello transaction with SorobanClient.Operation.invokeHostFunction **********/
        

        let method = "deposit";
        // let arg1 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScAddress.scAddressTypeAccount(publicKey))
        //let arg1 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoAddress(publicKey));
        let arg1 = new Address(invoker).toScVal();
        console.log("This is arg1 addr:", typeof(arg1));
        let low = new SorobanClient.xdr.Uint64(amount);
        console.log("line 29", low);
        let val = new SorobanClient.xdr.Int128Parts({lo: low, hi: low});
        let arg2 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoI128(val));
        console.log("This is arg2 addr:", val);


        let l = new SorobanClient.xdr.Uint64(unique_id);
        console.log("line 36  UINT64: ",l);
        let valu = new SorobanClient.xdr.Int128Parts({lo:l,hi:l});

        let arg3 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU128(valu));
        console.log("This is arg3 addr:", typeof(arg3));
        let arr = [arg1, arg2, arg3];

        // let hello_transaction_argument = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScVal.scvSymbol('World'))
        // let contractIdObj = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(Buffer.from(process.env.CONTRACT_ID, 'hex')));

        let dep_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
            fee: 100,
            networkPassphrase: process.env.NETWORK_PASSPHRASE,
            v1: true
        })
            .addOperation(contract.call(method, ...arr))
            .setTimeout(SorobanClient.TimeoutInfinite)
            .build();

        console.log("🚀 ~ file: helloServer.js ~ line 96 ~ main ~ build hello_transaction without footprint, only opts", dep_transaction);

        const inXdr = dep_transaction.toXDR();
        //let tras_xdr = transaction_with_footprint.toXDR();
        console.log("🚀 ~ file: helloServer.js ~ line 110 ~ main ~ transaction_with_footprint-:", inXdr);

        // await signTrx(tras_xdr);
        res.send(inXdr);

    }

    main();

}