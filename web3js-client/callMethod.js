import fetch from "node-fetch"; // required for airdrop
import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
dotenv.config()



async function contractTransaction(
    sourceAccount, //: SorobanClient.Account,
    // fee use to autocalculated using stellar-sdk // it still isn't available in soroban-client
    networkPassphrase, //: string,
    contractId, //: string,
    contract_method, //: string,
    ...params //: SorobanClient.xdr.ScVal[] // params here are in ScVal[] Type
) //: SorobanClient.Transaction 
{


    const contract = new SorobanClient.Contract(contractId) // instance of contract

    return new SorobanClient.TransactionBuilder(sourceAccount, {
        fee: '100', //'100' // fee, // '100' hardcoded for time being
        networkPassphrase,
    })
        .addOperation(contract.call(contract_method, ...params)) // we're doing something wrong here like footprints
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build()
}

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
function addFootprint(t, footprint) {
    if (footprint) {
        let source = new SorobanClient.Account(t.source, `${parseInt(t.sequence) - 1}`);
        let op = SorobanClient.Operation.invokeHostFunction({
            function: t.operations[0].function,
            parameters: t.operations[0].parameters,
            footprint: SorobanClient.xdr.LedgerFootprint.fromXDR(footprint, 'base64'),
        })

        return new SorobanClient.TransactionBuilder(source, {
            fee: '1000',
            networkPassphrase: SorobanClient.Networks.FUTURENET,
        })
            .addOperation(
                op
            )
            .setTimeout(0)
            .build();
    }

    return t;
}

async function main() {
    const contract = new SorobanClient.Contract(process.env.CONTRACT_ID);

    // fetching the private key of invoker from the .env file
    const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

    // Log the keypair details: Public and Secret Keys
    console.log(`Invoker Public Key: ${invokerKeypair.publicKey()}`);
    console.log(`Invoker Secret Key: ${invokerKeypair.secret()}`);

    const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true }); // we call node as server here
    console.log("🚀 ~ file: client.js ~ line 69 ~ main ~ server", server);

    console.log("🚀 ~ file: client.js ~ line 73 ~ main ~ invokerKeypair.publicKey()", invokerKeypair.publicKey());

    console.log("line: 102: ", await server.getAccount(invokerKeypair.publicKey()));
    let { sequence } = await server.getAccount(invokerKeypair.publicKey())
    console.log("🚀 ~ file: client.js ~ line 72 ~ main ~ sequence", sequence);
    let strSeq = sequence.toString();

    let invokerAccount = new SorobanClient.Account(invokerKeypair.publicKey(), strSeq) // In stellar-sdk: 
    // const invokerAccount = await server.getAccount(invokerKeypair.publicKey());
    console.log("🚀 ~ file: client.js ~ line 74 ~ main ~ invokerAccount", invokerAccount);


    let method = "world4";
    let p1 = 300;
    let arg1 = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(p1)));
    let arr = [arg1];

    let hello_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
        fee: 100,
        networkPassphrase: process.env.NETWORK_PASSPHRASE,
        v1: true
    })
        .addOperation(contract.call(method, ...arr))
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();
    console.log("🚀 ~ file: client.js ~ line 185 ~ main ~ build hello_transaction without footprint, only opts", hello_transaction);

    let footP = (await server.simulateTransaction(hello_transaction)).results;
    console.log("RESULTS: ", footP[0]);
    let footprint = footP[0].footprint;
    console.log("🚀 ~ file: client.js ~ line 131 ~ main ~ Transaction Simulated; footprint", footprint);

    let preparedTransaction = await server.prepareTransaction(hello_transaction, process.env.NETWORK_PASSPHRASE);
    console.log("🚀 ~ file: client.js ~ line 196 ~ main ~ transaction_with_footprint", preparedTransaction);
    preparedTransaction.sign(invokerKeypair);



    // "classic_transaction" does not have a footprint
    // let transaction_with_footprint = addFootprint(hello_transaction, footprint);
    // console.log("🚀 ~ file: client.js ~ line 196 ~ main ~ transaction_with_footprint", transaction_with_footprint);

    // transaction_with_footprint.sign(invokerKeypair);
    console.log('Transaction has been signed using invokerKeypair.');

    // Finally, send the singed tx obj to the servers.
    try {
        let response = await server.sendTransaction(preparedTransaction); // Soroban server do not have a submitTransaction endpoint
        console.log(`transaction_with_footprint was successfully submitted.\nComplete response: ${JSON.stringify(response)} \nTransaction hash: ${response.id}`);
    } catch (error) {
        console.log(`Tx Failed! More details:\n${JSON.stringify(error)}`);
    }
}

main();