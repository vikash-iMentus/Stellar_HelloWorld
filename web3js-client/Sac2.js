import fetch from "node-fetch";
import { Address, Contract } from "soroban-client";
import * as SorobanClient from "soroban-client"
import dotenv from "dotenv"
dotenv.config()


async function contractTransaction(
    sourceAccount, //: SorobanClient.Account,
    networkPassphrase, //: string,
    contractId, //: string,
    contract_method, //: string,
    ...params
) {

    const contract = new SorobanClient.Contract(contractId)

    return new SorobanClient.TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase,
    })
        .addOperation(contract.call(contract_method, ...params))
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build()
}
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
            console.log("🚀 ~ file: Sac2.js ~ line 46 ~ addFootprint ~ rawOp", rawOp);
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
    const invokerKeypair = SorobanClient.Keypair.fromSecret(process.env.PRIVATE_KEY_INVOKER);

    console.log(`Invoker Public Key: ${invokerKeypair.publicKey()}`);
    console.log(`Invoker Secret Key: ${invokerKeypair.secret()}`);

    const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true });
    console.log("🚀 ~ file: Sac2.js ~ line 68 ~ main ~ server", server);

    console.log("🚀 ~ file: Sac2.js ~ line 70 ~ main ~ invokerKeypair.publicKey()", invokerKeypair.publicKey());



    let invokerAccount = await server.getAccount(invokerKeypair.publicKey())
    console.log("🚀 ~ file: Sac2.js ~ line 75 ~ main ~ invokerAccount", invokerAccount);
    let cId = "GBOT5HNYQASVN2HFLTMSYPSOM2O3WAIFUKXXSF3RBSVXKY4BCL4NOUHN";

    let arg1 = new Address(cId);
    let buf = Buffer.from(arg1.toString());
    // let buf = arg1.toXDR();
    let autho = [new SorobanClient.xdr.AuthorizedInvocation(buf)]
    // console.log("Authorization: " , buf);
    let opts = {
        function: SorobanClient.xdr.HostFunction.hostFunctionTypeCreateContract(),
        parameters: [],
        footprint: new SorobanClient.xdr.LedgerFootprint({ readOnly: [], readWrite: [] }),

        auth: new SorobanClient.xdr.ContractAuth(new SorobanClient.xdr.AuthorizedInvocation(buf))
    };
    let conId = SorobanClient.xdr.ContractId.contractIdFromSourceAccount(buf);
    // let conId2 = SorobanClient.xdr.ContractId;
    console.log("ContractId: ", conId);
    // console.log("ContractId: ", conId.toXDR('base64'));

    let sourceVar = SorobanClient.xdr.ScContractCode.sccontractCodeToken();
    console.log("Source: ", sourceVar);


    let arg2 = new SorobanClient.xdr.CreateContractArgs(SorobanClient.xdr.ContractId.contractIdFromSourceAccount(buf),
        SorobanClient.xdr.ScContractCode.sccontractCodeToken());
    console.log("Arg2: ", arg2);
    opts.parameters.push(arg2);
    let hello_transaction = new SorobanClient.TransactionBuilder(invokerAccount, {
        fee: 100,
        networkPassphrase: process.env.NETWORK_PASSPHRASE,
        v1: true
    })
        .addOperation(SorobanClient.Operation.invokeHostFunction(opts))
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();

    console.log("Transaction: ", hello_transaction);

    let { footprint } = await server.simulateTransaction(hello_transaction);
    console.log("🚀 ~ file: client.js ~ line 131 ~ main ~ Transaction Simulated; footprint", footprint);

    // let preparedTransaction = await server.prepareTransaction(hello_transaction, process.env.NETWORK_PASSPHRASE);
    // console.log("prepareTransaction: ", preparedTransaction);


    // let transaction_with_footprint = addFootprint(hello_transaction, process.env.NETWORK_PASSPHRASE, contractCodeFootprint);
    // console.log("🚀 ~ file: client.js ~ line 196 ~ main ~ transaction_with_footprint", transaction_with_footprint);

    // try {
    //     let response = await server.sendTransaction(hello_transaction);
    //     console.log(`transaction_with_footprint was successfully submitted.\nComplete response: ${JSON.stringify(response)} \nTransaction hash: ${response.id}`);
    // } catch (error) {
    //     console.log(`Tx Failed! More details:\n${JSON.stringify(error)}`);
    // }
}

main();