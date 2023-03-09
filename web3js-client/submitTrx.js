import * as SorobanClient from "soroban-client"
import dotenv from "dotenv";
import { response } from "express";
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
        console.log("SEND Response: ",response);
        console.log(`transaction_with_footprint was successfully submitted.\nComplete response: ${JSON.stringify(response)} \nTransaction hash: ${response.id}`);
        res.send(`Transaction successfully submitted with Transaction hash: ${response.id}`);

        

        if (response) {
    
            console.log("RESPONSE:");
            // const id = "6dbf65225763f5f27397e3855db9b6eb867631b853c87de52889d21211a296e4";
            const idd = response.id;
            let res =  await server.getTransactionStatus(idd);
            console.log("result", res);
            // const tx = SorobanClient.TransactionBuilder.fromXDR(res.resultXdr, process.env.NETWORK_PASSPHRASE);
            // console.log("RESULTXDR: ", tx);
            // let result = JSON.stringify(SorobanClient.TransactionBuilder.fromXDR(res.resultXdr, process.env.NETWORK_PASSPHRASE))
            // let result = JSON.stringify(res.resultXdr);
            // console.log(result);
        }
    } catch (error) {
        console.log(`Tx Failed! More details:\n${JSON.stringify(error)}`);
    }

}


