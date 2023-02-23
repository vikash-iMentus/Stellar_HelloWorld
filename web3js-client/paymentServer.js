import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
dotenv.config()

export async function setPayment(req, res) {
    const { srcAddress, dstAddress, amount } = req.body;
    // helper function that utilizes contract instance's .call method to invoke a contract method in JS client
    // It didn't works for us for the time being. // saved for reference puposes.
    // async function contractTransaction(
    //     sourceAccount, //: SorobanClient.Account,
    //     // fee use to autocalculated using stellar-sdk // it still isn't available in soroban-client
    //     networkPassphrase, //: string,
    //     contractId, //: string,
    //     contract_method, //: string,
    //     ...params //: SorobanClient.xdr.ScVal[] // params here are in ScVal[] Type
    // ) //: SorobanClient.Transaction 
    // {

    //     const contract = new SorobanClient.Contract(contractId) // instance of contract

    //     return new SorobanClient.TransactionBuilder(sourceAccount, {
    //         fee: '100', //'100' // fee, // '100' hardcoded for time being
    //         networkPassphrase,
    //     })
    //         .addOperation(contract.call(contract_method, ...params)) // we're doing something wrong here like footprints
    //         .setTimeout(SorobanClient.TimeoutInfinite)
    //         .build()
    // }

    // function addFootprint(raw, networkPassphrase, footprint) {
    //     if ('innerTransaction' in raw) {
    //         // TODO: Handle feebump transactions
    //         return addFootprint(raw.innerTransaction, networkPassphrase, footprint);
    //     }
    //     // TODO: Figure out a cleaner way to clone this transaction.
    //     const source = new SorobanClient.Account(raw.source, `${parseInt(raw.sequence) - 1}`);
    //     const txn = new SorobanClient.TransactionBuilder(source, {
    //         fee: raw.fee,
    //         memo: raw.memo,
    //         networkPassphrase,
    //         timebounds: raw.timeBounds,
    //         ledgerbounds: raw.ledgerBounds,
    //         minAccountSequence: raw.minAccountSequence,
    //         minAccountSequenceAge: raw.minAccountSequenceAge,
    //         minAccountSequenceLedgerGap: raw.minAccountSequenceLedgerGap,
    //         extraSigners: raw.extraSigners,
    //     });
    //     for (let rawOp of raw.operations) {
    //         if ('function' in rawOp) {
    //             console.log("🚀 ~ file: client.js ~ line 55 ~ addFootprint ~ rawOp", rawOp);
    //             // TODO: Figure out a cleaner way to clone these operations
    //             txn.addOperation(SorobanClient.Operation.invokeHostFunction({
    //                 function: rawOp.function,
    //                 parameters: rawOp.parameters,
    //                 footprint: SorobanClient.xdr.LedgerFootprint.fromXDR(footprint, 'base64'), // just updating the footprint value here.
    //             }));
    //         } else {
    //             // TODO: Handle this.
    //             throw new Error("Unsupported operation type");
    //         }
    //     }
    //     return txn.build();
    // }

    async function main() {

        const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true }); // we call node as server here
        console.log("🚀 ~ file: client.js ~ line 69 ~ main ~ server", server);

        let { sequence } = await server.getAccount(`${srcAddress}`);
        console.log("🚀 ~ file: client.js ~ line 72 ~ main ~ sequence", sequence);

        let invokerAccount = new SorobanClient.Account(`${srcAddress}`, sequence) // In stellar-sdk: // const invokerAccount = await server.loadAccount(invokerKeypair.publicKey());
        console.log("🚀 ~ file: client.js ~ line 74 ~ main ~ invokerAccount", invokerAccount);

        /********** WAY 02: Build the hello transaction with SorobanClient.Operation.invokeHostFunction **********/
        // parameters required by fn SorobanClient.Operation.invokeHostFunction(opts) //default opts
        let opts = {
            function: SorobanClient.xdr.HostFunction.hostFnInvokeContract(),
            parameters: [],
            footprint: new SorobanClient.xdr.LedgerFootprint({ readOnly: [], readWrite: [] })
        };

        // updating above opts object
        let contractIdObj = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoBytes(Buffer.from(process.env.CONTRACT_ID, 'hex')));
        opts.parameters.push(contractIdObj); // 1. Push Contract ID

        let contractFnNameObj = SorobanClient.xdr.ScVal.scvSymbol("hello"); // let's say we want to invoke hello method
        opts.parameters.push(contractFnNameObj); // 2. Push Function Name

        let contractMethodParameterObj = SorobanClient.xdr.ScVal.scvSymbol("Hello"); // symbol passing
        console.log("This is name:", contractMethodParameterObj);
        opts.parameters.push(contractMethodParameterObj); // 3. Push Function Argument

        contractMethodParameterObj = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(3))); // u64 - working ref
        console.log("This is number:", contractMethodParameterObj);
        opts.parameters.push(contractMethodParameterObj); // 4. Push Function Argument 2


        let classic_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
            fee: 100,
            networkPassphrase: process.env.NETWORK_PASSPHRASE,
            v1: true
        })
            .addOperation(
                SorobanClient.Operation.payment({
                    destination: `${dstAddress}`,
                    asset: SorobanClient.Asset.native(),
                    amount: `${amount}`
                })
            )
            .setTimeout(SorobanClient.TimeoutInfinite)
            .build();
        console.log("🚀 ~ file: client.js ~ line 107 ~ main ~ classic_transaction", classic_transaction);

        const signedTx = await classic_transaction.toEnvelope().toXDR('base64')
        //console.log("This is trxFootprint::", transaction_with_footprint);

        console.log("🚀 ~ file: client.js ~ line 196 ~ main ~ transaction_with_footprint-:", signedTx);

        //await signTrx(tras_xdr);
        res.send(signedTx);

    }

    main();


}
