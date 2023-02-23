import fetch from "node-fetch"; // required for airdrop
import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
dotenv.config()


// helper function that utilizes contract instance's .call method to invoke a contract method in JS client
// It didn't works for us for the time being. // saved for reference puposes.
async function contractTransaction(
    sourceAccount, //: SorobanClient.Account,
    // fee use to autocalculated using stellar-sdk // it still isn't available in soroban-client
    networkPassphrase, //: string,
    contractId, //: string,
    contract_method, //: string,
    ...params //: SorobanClient.xdr.ScVal[] // params here are in ScVal[] Type
) //: SorobanClient.Transaction 
{
    // Connect to the SOROBAN_RPC_URL Node with the SorobanClient.
    // const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true }); // earlier server was needed to fetch the BaseFee, which no longer is needed, since hardcoded.
    // const fee = await server.fetchBaseFee(); // TypeError: server.fetchBaseFee is not a function

    const contract = new SorobanClient.Contract(contractId) // instance of contract

    return new SorobanClient.TransactionBuilder(sourceAccount, {
        fee: '100', //'100' // fee, // '100' hardcoded for time being
        networkPassphrase,
    })
        .addOperation(contract.call(contract_method, ...params)) // we're doing something wrong here like footprints
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build()
}

// helper function to add footprint to a transaction object
// footprint can only be added to operations that involves SorobanClient.Operation.invokeHostFunction
// TODO: Transaction is immutable, so we need to re-build it here. :(
// function addFootprint(raw: Transaction, networkPassphrase: string, footprint: SorobanClient.SorobanRpc.SimulateTransactionResponse['footprint']): Transaction {
function addFootprint(raw, networkPassphrase, footprint) {
    if ('innerTransaction' in raw) {
        // TODO: Handle feebump transactions
        return addFootprint(raw.innerTransaction, networkPassphrase, footprint);
    }
    // TODO: Figure out a cleaner way to clone this transaction.
    const source = new SorobanClient.Account(raw.source, `${parseInt(raw.sequence) - 1}`);
    const txn = new SorobanClient.TransactionBuilder(source, {
        fee: raw.fee,
        memo: raw.memo,
        networkPassphrase,
        timebounds: raw.timeBounds,
        ledgerbounds: raw.ledgerBounds,
        minAccountSequence: raw.minAccountSequence,
        minAccountSequenceAge: raw.minAccountSequenceAge,
        minAccountSequenceLedgerGap: raw.minAccountSequenceLedgerGap,
        extraSigners: raw.extraSigners,
    });
    for (let rawOp of raw.operations) {
        if ('function' in rawOp) {
            console.log("🚀 ~ file: client.js ~ line 55 ~ addFootprint ~ rawOp", rawOp);
            // TODO: Figure out a cleaner way to clone these operations
            txn.addOperation(SorobanClient.Operation.invokeHostFunction({
                function: rawOp.function,
                parameters: rawOp.parameters,
                footprint: SorobanClient.xdr.LedgerFootprint.fromXDR(footprint, 'base64'), // just updating the footprint value here.
            }));
        } else {
            // TODO: Handle this.
            throw new Error("Unsupported operation type");
        }
    }
    return txn.build();
}

async function main() {
    // fetching the private key of invoker from the .env file
    const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

    // Log the keypair details: Public and Secret Keys
    console.log(`Invoker Public Key: ${invokerKeypair.publicKey()}`);
    console.log(`Invoker Secret Key: ${invokerKeypair.secret()}`);

    // Note: Airdropping occurs only for the first time, if you're retrying the same peice of code multiple times, comment the airdrop snippet
    // airdropping on the SOROBAN_RPC_HOST network for the first time for some lumens
    // await Promise.all([invokerKeypair].map(async (kp) => {
    //     let airdrop = false;
    //     let retryCounter = 1;
    //     while (airdrop == false) {
    //         // Set up the Friendbot URL endpoints.
    //         // friendbotUrl = `https://friendbot.stellar.org?addr=${kp.publicKey()}`;
    //         // friendbotUrl = `http://localhost:8000/friendbot?addr=${kp.publicKey()}`;
    //         const friendbotUrl = `${process.env.SOROBAN_RPC_HOST}/friendbot?addr=${kp.publicKey()}`;
    //         let response = await fetch(friendbotUrl);
    //         retryCounter++;

    //         // Looking at the responses from fetch.
    //         let json = await response.json()
    //         console.log("🚀 ~ file: client.js ~ line 30 ~ awaitPromise.all ~ json response for airdrop: ", json);

    //         // Check that the response is OK, and give a confirmation message.
    //         if (response.ok) {
    //             console.log(`Account ${kp.publicKey()} successfully funded.`);
    //             airdrop = true;
    //         } else {
    //             console.log(`Something went wrong funding account: ${kp.publicKey()}`);
    //             console.log(`Trying again for ${retryCounter} time, for keypair: ${kp.publicKey()}`);
    //             console.log(`Note: Airdropping occurs only for the first time, if you're retrying the same piece of code multiple times, comment the airdrop snippet`);
    //         }
    //     }
    // }));n

    // Connect to the SOROBAN_RPC_URL Node with the SorobanClient.
    const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true }); // we call node as server here
    console.log("🚀 ~ file: client.js ~ line 69 ~ main ~ server", server);

    console.log("🚀 ~ file: client.js ~ line 73 ~ main ~ invokerKeypair.publicKey()", invokerKeypair.publicKey());

    let { sequence } = await server.getAccount(invokerKeypair.publicKey())
    console.log("🚀 ~ file: client.js ~ line 72 ~ main ~ sequence", sequence);

    let invokerAccount = new SorobanClient.Account(invokerKeypair.publicKey(), sequence) // In stellar-sdk: // const invokerAccount = await server.loadAccount(invokerKeypair.publicKey());
    console.log("🚀 ~ file: client.js ~ line 74 ~ main ~ invokerAccount", invokerAccount);

    // // Argument Type should be ScVal array object: SorobanClient.xdr.ScVal[] 

    // // let contractIncrementParameterObj = SorobanClient.xdr.ScVal.scvObject(
    // //     SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(incrementAmount))
    // // );
    // // opts.parameters.pusError: XDR Read Error: Unknown OperationType member for value 24h(contractIncrementParameterObj);

    // // Try 1: push it in opts.parameters
    // let hello_transaction_argument = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScVal.scvSymbol('World'))
    // console.log("🚀 ~ file: client.js ~ line 132 ~ main ~ hello_transaction_argument", hello_transaction_argument);

    // // Try 2: for helper function "contractTransaction"
    // let argument = SorobanClient.xdr.ScVal.scvObject(
    //     SorobanClient.xdr.ScObject.scoVec([
    //         SorobanClient.xdr.ScVal.scvSymbol('World')
    //     ])
    // )

    // /********** WAY 01: Build the hello transaction using a helper function: "contractTransaction" **********/
    // let hello_transaction = await contractTransaction(
    //     invokerAccount, //sourceAccount,
    //     process.env.NETWORK_PASSPHRASE,
    //     process.env.CONTRACT_ID,
    //     'hello',
    //     argument //hello_transaction_argument
    // )
    // console.log("🚀 ~ file: client.js ~ line 93 ~ main ~ build hello_transaction", hello_transaction);



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

    let contractMethodParameterObj = SorobanClient.xdr.ScVal.scvSymbol("World"); // symbol passing
    opts.parameters.push(contractMethodParameterObj); // 3. Push Function Argument

    contractMethodParameterObj = SorobanClient.xdr.ScVal.scvObject(SorobanClient.xdr.ScObject.scoU64(new SorobanClient.xdr.Uint64(3))); // u64 - working ref
    opts.parameters.push(contractMethodParameterObj); // 4. Push Function Argument 2

    // // Footprint Way 02 // For reference purposes
    // let contractCodeFootprint = SorobanClient.xdr.ScVal.scvStatic(SorobanClient.xdr.ScStatic.scsLedgerKeyContractCode());
    // // let incrementStateFootprint = SorobanClient.xdr.ScVal.scvSymbol("COUNTER");
    // opts.footprint.readOnly().push(SorobanClient.xdr.LedgerKey.contractData(new SorobanClient.xdr.LedgerKeyContractData({ contractId: Buffer.from(process.env.CONTRACT_ID, 'hex'), key: contractCodeFootprint })))
    // // opts.footprint.readWrite().push(SorobanClient.xdr.LedgerKey.contractData(new SorobanClient.xdr.LedgerKeyContractData({ contractId: Buffer.from(process.env.CONTRACT_ID, 'hex'), key: incrementStateFootprint })))

    // We'll add footprint in tx below, using way 01

    let hello_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
        fee: 100,
        networkPassphrase: process.env.NETWORK_PASSPHRASE,
        v1: true
    })
        .addOperation(SorobanClient.Operation.invokeHostFunction(opts))
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();
    console.log("🚀 ~ file: client.js ~ line 185 ~ main ~ build hello_transaction without footprint, only opts", hello_transaction);

    // updating footprint in hello_transaction // Footprint Way 01:
    // // Next: Simulating Transaction to get a footprint // Transaction should contain invoke host function operation in order to get a footprint
    let { footprint } = await server.simulateTransaction(hello_transaction);
    console.log("🚀 ~ file: client.js ~ line 131 ~ main ~ Transaction Simulated; footprint", footprint);
    // "classic_transaction" does not have a footprint

    // // Footprint Way 01
    // // attaching the footprint created above to the previously created transaction object
    let transaction_with_footprint = addFootprint(hello_transaction, process.env.NETWORK_PASSPHRASE, footprint);
    console.log("🚀 ~ file: client.js ~ line 196 ~ main ~ transaction_with_footprint", transaction_with_footprint);

    // // Sign transaction_with_footprint using the invokerKeypair.
    transaction_with_footprint.sign(invokerKeypair);
    console.log('Transaction has been signed using invokerKeypair.');

    // Finally, send the singed tx obj to the servers.
    try {
        let response = await server.sendTransaction(transaction_with_footprint); //Soroban server do not have a submitTransaction endpoint
        console.log(`transaction_with_footprint was successfully submitted.\nComplete response: ${JSON.stringify(response)} \nTransaction hash: ${response.id}`);
    } catch (error) {
        console.log(`Tx Failed! More details:\n${JSON.stringify(error)}`);
    }

    // /********** Dummy Classic Tx Obj: For Reference **********/
    let classic_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
        fee: 100,
        networkPassphrase: process.env.NETWORK_PASSPHRASE,
        v1: true
    })
        .addOperation(
            SorobanClient.Operation.payment({
                destination: 'GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW',
                asset: SorobanClient.Asset.native(),
                amount: '100.50'
            })
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();
    console.log("🚀 ~ file: client.js ~ line 107 ~ main ~ classic_transaction", classic_transaction);

    // Notes:
    // In case of error: `Error: XDR Write Error: [object Object] is not a LedgerKey` => seen when we try to invoke a custom method of custom smart contract; => try `let xdr_tx = hello_transaction.toXDR();`
}

main();