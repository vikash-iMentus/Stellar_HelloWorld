import * as SorobanClient from 'soroban-client'; // // import * as SorobanClient from "stellar-sdk"
import { addFootprint } from './addfootprint.js';
import { encode } from './encode.js';
import { parse } from './xdrConverter.js';
import { Address, Contract } from "soroban-client";
import crypto from 'crypto';


// const CONTRACT_ID ='b876fcda3560b559b0ae66dcc520bfbd5f170de3edbe72721de0b575fa2d11a8'; //values
const contractId ='6052743135c590f4b812615bdc999bc5a4aa1a19efc172c1f611244249a69658';
// const CONTRACT_ID ='99aa90dc4eeb4acf8aba9eb5f5c2f1df95c082431c843d2d3d359c343b256491'; //Trilobyte
const PUBLICKEY = 'GAQHL6ZPILHKVSC7OG7NRJP2X33MYYF4PQCWVTLMLKUHLNFS4FF4NPTI';
const PRIVATE_KEY = 'SADJKHWL7RK5KBBOAFGKM257GK7QXYN5YYHHDMGEYHUKZ3WLVLX5JWVI';
// const PRIVATE_KEY = 'SCSKEK7NRJSCBQLXNXXBDYTTKHDQHYFAL6ME22IQ2VSMZLJOKNZOXG3B';
const NETWORK_PASSPHRASE = 'Test SDF Future Network ; October 2022';
const SOROBAN_RPC_URL = 'https://horizon-futurenet.stellar.cash:443/soroban/rpc';

  
  fetchContractValue();
  async function fetchContractValue() {
    const invokerKeypair = SorobanClient.Keypair.fromSecret(PRIVATE_KEY);
    let xdr = SorobanClient.xdr;
    const server = new SorobanClient.Server(SOROBAN_RPC_URL, { allowHttp: true }); 
    
    const salt = crypto.randomBytes(32);
    const hexSalt = salt.toString('hex');
  
    const objs = [
        { type: 'address', value:'GATD645QCSAXJUWEVW3AYO4BLGALDRMGKCYXWMUCB4XNSWMSK32MGEQI' },
        { type: 'scvU32', value: 2000 },
        { type: 'scvU32', value: 8 },
        { type: 'scvU32', value: 8 },
        { type: 'bytesn32', value: "60b32529639664bb964182e528f7b48439ebb594632cb1dfc45fc534c3488fb7" },
        { type: 'bytesn32', value: 'b60fb504dd93ab0a003b3859647ef36cc8bf838ba801fa56f34cb3b2e94b9d61' },
        { type: 'bytesn32', value: hexSalt },
        { type: 'vecAddress', value: ["GCJYZB7X74BXD656IZNCB4QOYOPCX5CDRJQ2SNTVH4ADZJGPTGTYDSQV"] },
        { type: 'vecAddress', value: ["GCJYZB7X74BXD656IZNCB4QOYOPCX5CDRJQ2SNTVH4ADZJGPTGTYDSQV"] },
      ];
      
      const params = objs.map(encode);
  
    const method = 'vault_req';

    const contract = new SorobanClient.Contract(contractId);
    let _sequence = await server.getAccount(invokerKeypair.publicKey());
    const transaction = new SorobanClient.TransactionBuilder(_sequence, {
      fee: '200',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...params))
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build();
  
    const simulateTx = await server.simulateTransaction(transaction);
  
    const { results } = await server.simulateTransaction(transaction);
  
    let footprint = results[0]?.footprint;
  
    let _addFootprint = addFootprint(transaction, NETWORK_PASSPHRASE, footprint);
  
    _addFootprint.sign(invokerKeypair);
  
    try {
      let { id } = await server.sendTransaction(_addFootprint);
  
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
               let val = parse(xdr.ScVal.fromXDR(response.results[0].xdr, 'base64'))
             console.log("val",val);
              return val;
            }
            case 'error': {
              throw response.error;
            }
            default: {
              throw new Error(
                'Unexpected transaction status: ' + response.status
              );
            }
          }
        } catch (err) {
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
    let value = xdr.ScVal.fromXDR(Buffer.from(result.xdr, 'base64'));
    console.log("value",value);
    return value
  }
  
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
