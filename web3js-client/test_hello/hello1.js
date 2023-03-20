import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Address, Contract } from "soroban-client";
dotenv.config()

export async function Hello1(req, res) {
    const { p1, p2, p3, p4, p5, p6, p7, p8, srcAddress } = req.body;

    async function main() {

        const server = new SorobanClient.Server(process.env.SOROBAN_RPC_URL, { allowHttp: true }); // we call node as server here

        const contract = new SorobanClient.Contract(process.env.CONTRACT_ID);
        //let { sequence } = await server.getAccount(invokerKeypair.publicKey())
        let { sequence } = await server.getAccount(srcAddress)

        let invokerAccount = new SorobanClient.Account(`${srcAddress}`, sequence.toString())
        // console.log("🚀 ~ file: helloServer.js ~ line 59 ~ main ~ invokerAccount", invokerAccount);

        /********** WAY 02: Build the hello transaction with SorobanClient.Operation.invokeHostFunction **********/
        

        let method = "vault_req";

        // SYMBOL
        // let arg1 = SorobanClient.xdr.ScVal.scvObject(new SorobanClient.xdr.ScVal.scvSymbol(p1));
        let arg1 = new SorobanClient.xdr.ScVal.scvSymbol(p1);
        // console.log("This is arg1 addr:", typeof(arg1));
        // console.log("VALUE: ", arg1._value)

        // i128
        let i64 = new SorobanClient.xdr.Uint64(p2);
        let i128 = new SorobanClient.xdr.Int128Parts({lo:i64,hi:i64});

        let arg2 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoI128(i128));
        console.log("This is arg2 addr:", typeof(arg2));
        console.log("VALUE: ", arg2._value)

        // U128
        let u64 = new SorobanClient.xdr.Uint64(p3);
        let u128 = new SorobanClient.xdr.Int128Parts({lo:u64,hi:u64});

        let arg3 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU128(u128));
        console.log("This is arg3 addr:", typeof(arg3));
        console.log("VALUE: ", arg3._value)

        // U64
        // let low = new SorobanClient.xdr.Uint64(amount);
        let arg4 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(p4)));
        // let arg4 = SorobanClient.xdr.ScVal.scvObject.scoU64(new SorobanClient.xdr.Uint64(p4));
        console.log("This is arg4 addr:", typeof(arg4));
        console.log("VALUE: ", arg4._value)

        // U32
        let arg5 = SorobanClient.xdr.ScVal.scvU32(p5);
        console.log("This is arg5 val:", typeof(arg5));
        console.log("VALUE: ", arg5._value)

        // ADDRESS
        let arg6 = new Address(p6).toScVal();
        console.log("This is arg6 addr:", typeof(arg6));
        console.log("VALUE: ", arg6._value)

        // VECTOR ADDRESS
        let ar_addr = [];
        let scAd;
        let addr;
        let strAddress= "";
        for (let i = 0; i < p7.length; i++) {  
            strAddress = p7[i].toString();
            console.log(typeof(strAddress));
            scAd = new Address(strAddress).toScAddress();
            addr = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoAddress(scAd));
            ar_addr.push(addr)
        }
        let arg7 =  SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoVec(ar_addr));
        console.log("This is arg7 addr:", typeof(arg7));
        console.log("VALUE: ", arg7._value)
        
        // BYTES<N32>
        let arg8 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(Buffer.from(p8, 'hex')));
        console.log("This is arg8 val:", typeof(arg8));
        console.log("VALUE: ", arg8._value)

        // Array
        let arr = [arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8];

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

        // await signTrx(tras_xdr);
        res.send(inXdr);

    }

    main();

}