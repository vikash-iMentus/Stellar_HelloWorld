import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
import { Contract } from "soroban-client";
dotenv.config()

// The source account is the account we will be signing and sending from.
const sourceSecretKey = 'SCA4TNWELC3QANZTEO47EZCH2MN65PUUD77K2JV4OZVWPKYHFEYE2QWQ';

// Derive Keypair object and public key (that starts with a G) from the secret
const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();
console.log("Public key is LN12::", sourcePublicKey);

const receiverPublicKey = 'GD5BPDLGED7ELAJN5D7JS5OFBLK3HT6BF5PBZFTFGDF5HTKYTER5VN4J';

const contractId = process.env.CONTRACT_ID;
console.log("Contract id is LN17::", contractId);

// Configure SorobanClient to talk to the soroban-rpc instance running on your
// local machine.
const server = new SorobanClient.Server(
    process.env.SOROBAN_RPC_URL,
    { allowHttp: true }
);

console.log("This is server LN26::", server);

(async function main() {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.getAccount(sourcePublicKey);
    console.log("This is account LN32::", account);

    // Right now, this is just the default fee for this example.
    const fee = 100;

    const contract = new SorobanClient.Contract(contractId);

    let transaction = new SorobanClient.TransactionBuilder(account, {
        fee,
        // Uncomment the following line to build transactions for the live network. Be
        // sure to also change the soroban-rpc hostname.
        // networkPassphrase: SorobanClient.Networks.PUBLIC,
        networkPassphrase: SorobanClient.Networks.STANDALONE
    })
        // Add a contract.increment soroban contract invocation operation
        .addOperation(contract.call("test_world"))
        // Make this transaction valid for the next 30 seconds only
        .setTimeout(30)
        // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
        // .addMemo(SorobanClient.Memo.text('Hello world!'))
        .build();

    console.log("This is transaction object LN54::", transaction);

    // Simulate the transaction to discover the storage footprint, and update the
    // transaction to include it. If you already know the storage footprint you
    // can use `addFootprint` to add it yourself, skipping this step.
    transaction = await server.prepareTransaction(transaction);
    console.log("This is transaction LN60::", transaction);

    // Sign this transaction with the secret key
    // NOTE: signing is transaction is network specific. Test network transactions
    // won't work in the public network. To switch networks, use the Network object
    // as explained above (look for SorobanClient.Network).
    transaction.sign(sourceKeypair);

    // Let's see the XDR (encoded in base64) of the transaction we just built
    console.log("Converted trx LN69::", transaction.toEnvelope().toXDR('base64'));

    // Submit the transaction to the Soroban-RPC server. The Soroban-RPC server
    // will then submit the transaction into the network for us. Then we will have
    // to wait, polling getTransactionStatus until the transaction completes.
    try {
        let response = await server.sendTransaction(transaction);
        console.log('Sent! Transaction ID:', console.log(response.id));
        // Poll this until the status is not "pending"
        while (response.status === "pending") {
            // See if the transaction is complete
            response = await server.getTransactionStatus(response.id);
            // Wait a second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('Transaction status:', response.status);
        console.log(JSON.stringify(response));
    } catch (e) {
        console.log('An error has occured:');
        console.log(e);
    }
})();