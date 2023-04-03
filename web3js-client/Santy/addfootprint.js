import * as SorobanClient from 'soroban-client';
import { decode } from './utilities/base64.js';

const PUBLICKEY = 'GAQHL6ZPILHKVSC7OG7NRJP2X33MYYF4PQCWVTLMLKUHLNFS4FF4NPTI';
// const PUBLICKEY = 'GBBUGF3HLI24JHTY4NXMY76DGJ4CYUVD6CFY26SV6FOZQQQPJQOBIMUI';

export const addFootprint = (raw, networkPassphrase, footprint) => {
  if ('innerTransaction' in raw) {
    console.log('innertransaction');
    // TODO: Handle feebump transactions
    return addFootprint(raw.innerTransaction, networkPassphrase, footprint);
  }
  // TODO: Figure out a cleaner way to clone this transaction.
  const source = new SorobanClient.Account(
    PUBLICKEY,
    `${parseInt(raw.sequence) - 1}`
  );
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
        console.log("🚀 ~ addFootprint ~ rawOp", decode('d9bc67c4b0b8b7d14677a3a9af8d2e014a1895d80e458beea9b27453c0bcb50b'))
        
    //   let invocation =new SorobanClient.xdr.AuthorizedInvocation({
    //     contractId: [],
    //     functionName: '_Symbol',
    //     args: null,
    //     subInvocations: [],
    //   });
    //   let contractAuth =new SorobanClient.xdr.ContractAuth({
    //     addressWithNonce: null,
    //     rootInvocation: invocation,
    //     signatureArgs: [],
    //   });
      console.log(
        '🚀 ~ file: client.js ~ line 55 ~ addFootprint ~ rawOp',
        rawOp
      );
      // TODO: Figure out a cleaner way to clone these operations
      txn.addOperation(
        SorobanClient.Operation.invokeHostFunction({
          function: rawOp.function,
          parameters: rawOp.parameters,
          footprint: SorobanClient.xdr.LedgerFootprint.fromXDR(
            footprint,
            'base64'
          ), // just updating the footprint value here.
          auth: [],
        })
      );
    } else {
      // TODO: Handle this.
      throw new Error('Unsupported operation type');
    }
  }

  return txn.build();
  // return footprint;
};
