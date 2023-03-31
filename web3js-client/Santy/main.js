import * as SorobanClient from 'soroban-client'; // // import * as SorobanClient from "stellar-sdk"
import { addFootprint } from './addfootprint.js';
import { encode } from './encode.js';
import { parse } from './xdrConverter.js';


const CONTRACT_ID ='b876fcda3560b559b0ae66dcc520bfbd5f170de3edbe72721de0b575fa2d11a8'; //values
// const CONTRACT_ID ='99aa90dc4eeb4acf8aba9eb5f5c2f1df95c082431c843d2d3d359c343b256491'; //Trilobyte
const PUBLICKEY = 'GAQHL6ZPILHKVSC7OG7NRJP2X33MYYF4PQCWVTLMLKUHLNFS4FF4NPTI';
const PRIVATE_KEY = 'SADJKHWL7RK5KBBOAFGKM257GK7QXYN5YYHHDMGEYHUKZ3WLVLX5JWVI';
const NETWORK_PASSPHRASE = 'Test SDF Future Network ; October 2022';
const SOROBAN_RPC_URL =
  'https://horizon-futurenet.stellar.cash:443/soroban/rpc';
const invokerKeypair = SorobanClient.Keypair.fromSecret(PRIVATE_KEY);
let xdr = SorobanClient.xdr;
const server = new SorobanClient.Server(SOROBAN_RPC_URL, { allowHttp: true }); // we call node as server here

test_BY();
async function test_BY() {
  console.log('start test', server);
  try {
    let methodName = 'custom';
    let obj = {
      type: 'scvSymbol', // scvSymbol, scvU32,scoU64,bytesn32,address
      value:"divya",
    };
    // let obj2 = {
    //   type: 'scvU32', // scvSymbol, scvU32,scoU64,bytesn32,address
    //   value: 4,
    // };
    let argument = encode(obj);
    // let argument2 = encode(obj2);
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
