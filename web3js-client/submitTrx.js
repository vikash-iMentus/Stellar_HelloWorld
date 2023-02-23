import * as SorobanClient from "soroban-client"
import dotenv from "dotenv";
//import StellarSdk from 'stellar-sdk';
dotenv.config()

export async function submitTrs(req, res) {
    const { xdrForm } = req.body;
    console.log("This is xdrForm::", xdrForm);

    const tx = SorobanClient.TransactionBuilder.fromXDR(`${xdrForm}`, process.env.NETWORK_PASSPHRASE);

    console.log("This is converted trx in object:", tx);

    const server = new SorobanClient.Server(`${process.env.SOROBAN_RPC_URL}`, { allowHttp: true }); // we call node as 
    try {
        let response = await server.sendTransaction(tx); //Soroban server do not have a submitTransaction endpoint
        console.log(`transaction_with_footprint was successfully submitted.\nComplete response: ${JSON.stringify(response)} \nTransaction hash: ${response.id}`);
        res.send(`Transaction successfully submitted with Transaction hash: ${response.id}`);

    } catch (error) {
        console.log(`Tx Failed! More details:\n${JSON.stringify(error)}`);
    }

}


