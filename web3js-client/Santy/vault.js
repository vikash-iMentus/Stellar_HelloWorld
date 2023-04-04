import * as SorobanClient from 'soroban-client'; // // import * as SorobanClient from "stellar-sdk"
import { addFootprint } from './addfootprint.js';
import { encode } from './encode.js';
import { parse } from './xdrConverter.js';
import { Address, Contract } from "soroban-client";

import * as base64 from 'base64-js';
import { sha256 } from 'js-sha256';

function stellarAddressToBytes32(address) {
  // Decode the base32-encoded address
  const decoded = base64.toByteArray(address);

  // Strip the network prefix (the first byte) and checksum (the last 2 bytes)
  const stripped = decoded.slice(1, -2);

  // Compute the SHA-256 hash of the stripped bytes
  const hashed = sha256.array(stripped);

  // Return the first 32 bytes of the hash
  return hashed.slice(0, 32);
}

// const CONTRACT_ID ='b876fcda3560b559b0ae66dcc520bfbd5f170de3edbe72721de0b575fa2d11a8'; //values
const CONTRACT_ID ='83bb24937da7a37d009a1d09dc2e3090355021385824257723fe163c74781a85';
// const CONTRACT_ID ='99aa90dc4eeb4acf8aba9eb5f5c2f1df95c082431c843d2d3d359c343b256491'; //Trilobyte
const PUBLICKEY = 'GAQHL6ZPILHKVSC7OG7NRJP2X33MYYF4PQCWVTLMLKUHLNFS4FF4NPTI';
const PRIVATE_KEY = 'SADJKHWL7RK5KBBOAFGKM257GK7QXYN5YYHHDMGEYHUKZ3WLVLX5JWVI';
// const PRIVATE_KEY = 'SCSKEK7NRJSCBQLXNXXBDYTTKHDQHYFAL6ME22IQ2VSMZLJOKNZOXG3B';
const NETWORK_PASSPHRASE = 'Test SDF Future Network ; October 2022';
const SOROBAN_RPC_URL = 'https://horizon-futurenet.stellar.cash:443/soroban/rpc';
const invokerKeypair = SorobanClient.Keypair.fromSecret(PRIVATE_KEY);
let xdr = SorobanClient.xdr;
const server = new SorobanClient.Server(SOROBAN_RPC_URL, { allowHttp: true }); // we call node as server here

test_BY();
async function test_BY() {
  console.log('start test', server);
  const address = "GCJYZB7X74BXD656IZNCB4QOYOPCX5CDRJQ2SNTVH4ADZJGPTGTYDSQV";
let bytes32 = stellarAddressToBytes32(address);
 bytes32 =   Buffer.from(bytes32).toString('hex');

  try {
    let methodName = 'vault';
    let obj = {
      type: 'scoU128', // scvSymbol, scvU32,scoU64,bytesn32,address
      value: 0,
    };
   
    let argument = encode(obj);    
    console.log('🚀 ~ test_BY ~ argument', argument);

    let arr = [argument];
    let result = await fetchContractValue(
      server,
      CONTRACT_ID,
      methodName,
      ...arr
    );
    
    console.log('resutl', result);
  } catch (error) {
    console.log('error', error);
    if (typeof error == 'string') {
      return;
    }
    if ('message' in error) {
      return;
    }
  }
}

async function fetchContractValue(server, contractId, method, ...params) {
  //create contract instance
  const contract = new SorobanClient.Contract(contractId);
  console.log('🚀 ~ GeneralBorrower ~ contract', contract);
  //get sequence of user address
  let _sequence = await server.getAccount(invokerKeypair.publicKey());
  console.log(
    '🚀 ~ fetchContractValue ~ _sequence',
    _sequence.sequence.toString()
  );

  const transaction = new SorobanClient.TransactionBuilder(_sequence, {
    fee: '200',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build();

  const simulateTx = await server.simulateTransaction(transaction);
  console.log('🚀 ~ GeneralBorrower ~ simulateTx', simulateTx);

  const { results } = await server.simulateTransaction(transaction);
  console.log('🚀 ~ fetchContractValue ~ results', results);

  let footprint = results[0]?.footprint;
  console.log('🚀 ~ fetchContractValue ~ footprint', footprint);

  let _addFootprint = addFootprint(transaction, NETWORK_PASSPHRASE, footprint);
  console.log('🚀 ~ fetchContractValue ~ _addFootprint', _addFootprint);

  _addFootprint.sign(invokerKeypair);

  try {
    let response = await server.sendTransaction(_addFootprint); //Soroban server do not have a submitTransaction endpoint
    let { id } = await server.sendTransaction(_addFootprint); //Soroban server do not have a submitTransaction endpoint
    console.log('response', response);

    const sleepTime = Math.min(1000, 6000);

    for (let i = 0; i <= 6000; i += sleepTime) {
      await sleep(sleepTime);
      try {
        const response = await server.getTransactionStatus(id);
        switch (response.status) {
          case 'pending': {
            continue;
          }
          case 'success': {
            if (response.results?.length != 1) {
              throw new Error('Expected exactly one result');
            }

            console.log(
              'res-------------',
              parse(xdr.ScVal.fromXDR(response.results[0].xdr, 'base64'))
            );
            return parse(xdr.ScVal.fromXDR(response.results[0].xdr, 'base64'));
          }
          case 'error': {
            console.log('response error', response.error);
            throw response.error;
          }
          default: {
            throw new Error(
              'Unexpected transaction status: ' + response.status
            );
          }
        }
      } catch (err) {
        // setState('error');
        if ('code' in err && err.code === 404) {
          // No-op
        } else {
          throw err;
        }
      }
    }
  } catch (error) {
    console.log('🚀 ~ GeneralBorrower ~ error', error);
  }

  const result = results[0];
  return xdr.ScVal.fromXDR(Buffer.from(result.xdr, 'base64'));
}
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
