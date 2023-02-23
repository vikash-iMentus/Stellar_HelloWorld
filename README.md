# Project-ORUN | Vault

## Uncollateralized lending

Project-Orun is aiming to build an uncollateralized lending platform using the Stellar Soroban smart contract platform. Accountability will be governed via centralized entity. We will start by developing line of credit pools that are specific to borrowers. The system will consist of the following building blocks:

1. Borrower
2. Vault | Lending Pool auto-created by smart contract
3. Funding Phase
4. Approval Phase
5. Lending Phase
6. Completion Phase

## The Borrower

The borrower starts the process by defining the parameters for the loan which are:

- LentToken: for the moment it will be the EBI token from the UI. However, the backend code should not hardcode it
- Loan Term: the loan must be repaid by the end of this term
- Principal: This is the principal amount of the loan. (say 100,000 EBI Tokens)
- Rate: This is a fixed interest rate the borrower will pay for the loan (the borrower can select from a list between 8% and 15% in the UI)

Upon defining those parameters, a smart contract lending pool will be created for that specific borrower.

## Vault | Lending Pool auto-created by smart contract

- This is an automatically created pool based on the borrower's request.
- Here the lender deposits the LentToken (say EBI Token) to the borrower's created Pool | Vault.

The inner working of this pool will be as follows:

- Upon creation of the pool, the pool enters a 'funding' phase until the total value of the principal amount has been reached (say 100,000 EBI Tokens)
- Once the principal amount of LentToken has been reached. The pool enters into an 'approval' phase.
- In the "approval" phase the Borrower approves the loan by invoking a function on the smart contract that withdraws the LentToken from the pool and sends it to the borrower's address. This then triggers the next phase i.e., the "lending" phase.
- In the "lending" phase, the lenders will wait till the loan term completes or the Vault fulfills back with lentTokens that were initially borrowed by Borrower
- The "complete" phase is reached at the end of the loan term or when the payment is complete.

## Phase 1: The funding phase

- The funding phase is the phase when the lenders are adding LentToken into the pool.
- The Borrower needs to wait until this phase is finished to be able to withdraw the funds.

- During this phase, debtTokens (specific to this pool) are created and minted to the lenders who initially deposited lentTokens into the pool.
- The math behind debtTokens = lentTokens + interest. (let's say 100 EBI Tokens (lentTokens) + 10% interest (10 EBI Tokens) ==> will imply minting of 110 debtEBI tokens in lender's wallet)
- The minted debtTokens represent a share in the funds repaid plus interest at the end of the term.
- debtTokens are minted at a discounted rate, meaning for every LentToken deposited, LentToken + (LentToken _ rate _ term) debtTokens are minted
- debtTokens are sent directly to the lender upon depositing the LentToken
- debtTokens are not transferable (Dev Phase 2)
- during this phase, the pool is not locked for lenders. This means that lenders can take out their LentToken by depositing back the debtToken they have.
- during this phase, the pool is locked for the borrower. This means that the borrower cannot take any funds out of the pool until the 'lending phase' has started

## Phase 2: The approval phase

- The borrower just calls a function to withdraw the funds from the lending pool into his address
- Once a loan is funded, the borrower can call a function that allows them to take the funds out of the smart contract
- This phase is required for cross border CUBA <-> USA obligations

## Phase 3: The lending phase

- This phase starts when the principal amount of the loan has been reached.
- Once this happens, lenders cannot take out funds anymore until the end of the loan term
- In this phase, the borrower can add funds back in intervals at any time

## Phase 4: The complete phase

- This phase starts at the end of the loan term
- Lenders can start exchanging their debtTokens for the LentTokens in the pool in 1:1 ratio
- debtTokens are equal to original funds plus interest

## Technical details

Below is a short description of the technical details:

### The Funding phase

- Mint/Burn debtTokens is enabled
- Lenders can send LentToken to the contract
  -> mint debtTokens according to discount rate model
- Lenders Can never deposit more than the principal
  -> Return amount over principal if sending more than principal
- Funding is complete once we reach principal amount
- During Funding, can exchange debtTokens for LentToken
  -> Funds aren't locked until Lending Phase

### The Approval phase

- Once the smart contract has raised the principal amount of LentTokens:
  -> Borrower can call a function to approve the loan
  -> Approving the loan withdraws funds to borrower address
  -> Loan expiry is set to: block.timestamp + length
  -> Mint/Burning Loan tokens is disabled

### The Lending phase

- Here we're waiting for block timestamp < expiry
- Mint/Burning Loan tokens is disabled
- Borrower can pay back deposit tokens at any time (but cannot withdraw)

### The Complete phase

- Once block timestamp > expiry, we enter the complete phase
- Burning enabled (Minting disabled)
- debtTokens can be further burned in exchange with lentTokens via smart contract
- Ideally borrower would have paid back (principal + (principal _ rate _ term))

## Installation | Test | Hello World Contract + Token Smart Contract

- `rustup update`
- `cd ./soroban-hello-token/smartcontract`
- Spin a standalone network simillar to futurenet == `solana-test-validator`

```shell
sudo docker run --rm -it \
  --platform linux/amd64 \
  -p 8000:8000 \
  --name stellar \
  stellar/quickstart:soroban-dev@sha256:0993d3350148af6ffeab5dc8f0b835236b28dade6dcae77ff8a09317162f768d \
  --standalone \
  --enable-soroban-rpc
```

- airdrop the token issuer address by invoking endpoint: `curl http://localhost:8000/friendbot?addr=GAKDQIKUCRYB4OT7OJYZNNCHH5GKGKITUTXSZD77AY3LODSZGPP3YNB6`
- airdrop the hello world smart contract deployer address by invoking endpoint: `curl http://localhost:8000/friendbot?addr=GAQVOAUDQO4KPSRFDGNQFHIFVTSQKJNRA6WT7D6QFUYVQRUZVEENITES`
- airdrop the invoker's/user1 address by invoking endpoint: `curl http://localhost:8000/friendbot?addr=GB3TNQGXAHGYWS6JL6UGZ26RAN5NDDVCAXGTIC24HNSUGK6F72ABZ33X`
- To get tokens in standalone environment; next hit changeTrustline and payment operations using `cd ../web3js-client && node createAsset.js`

- Build the smart contract `cd ../smartcontract && cargo build --target wasm32-unknown-unknown --release`
- Deploy smart contract on local network

```shell
soroban deploy \
    --wasm ./target/wasm32-unknown-unknown/release/soroban_hello_world.wasm \
    --secret-key SA3RSJBJJNO56JJXRDULBL4XT3WLIK6USGEUCPC2Q4Q2YPFEYNTZRHUY \
    --rpc-url http://localhost:8000/soroban/rpc \
    --network-passphrase 'Standalone Network ; February 2017'
```
- replace contract id at all places and in .env files
- `` // This will use std crate to print local logs as well
- Invoke "hello" method of smart contract with soroban-cli

```shell
soroban invoke \
    --id 398bc62102554d0186f9fb6093820411806a76a2c716c3cdf13c9bf210062da8 \
    --secret-key SBFQBFIDHAVLX6TLU5BJWAPGI6DZGRTVHVOL4YFHXYNTK53ZR6ASH4FU \
    --rpc-url http://localhost:8000/soroban/rpc \
    --network-passphrase 'Standalone Network ; February 2017' \
    --fn hello \
    --arg friend 3
```

- Invoke "hello" method of smart contract using the web3js-client
  `cd ../web3js-client && node client.js`

- Invoke "hello" method of smart contract using the python-client

  - `pip install -r ./requirements.txt`
  - `python3 python-client.py`

- Deploy/Wrap Token Contract for recently minted tokens with soroban-cli:
  - tried removing `--rpc-url http://localhost:8000/soroban/rpc \` and instead used `--ledger-file .soroban/ledger.json \`

```shell
soroban token wrap \
    --asset "EBI:GAKDQIKUCRYB4OT7OJYZNNCHH5GKGKITUTXSZD77AY3LODSZGPP3YNB6" \
    --ledger-file .soroban/ledger.json \
    --secret-key SBMQTWLUE2QGUKK6CNVQBBWWVJYL2UC4ZC5NSIZ4S53PLQP4O5UENW6K \
    --network-passphrase 'Standalone Network ; February 2017'
```

or in case you want to create a fresh token strict to soroban environment

```shell
soroban token create \
    --admin "GAKDQIKUCRYB4OT7OJYZNNCHH5GKGKITUTXSZD77AY3LODSZGPP3YNB6" \
    --secret-key SBMQTWLUE2QGUKK6CNVQBBWWVJYL2UC4ZC5NSIZ4S53PLQP4O5UENW6K \
    --rpc-url http://localhost:8000/soroban/rpc \
    --network-passphrase 'Standalone Network ; February 2017' \
    --name "EBI Token" \
    --symbol "EBI" \
    --decimal 2
```

- Tried Wrapping token on futurenet after spinning a futurenet node on local machine, but didn't worked

```shell
soroban token wrap \
    --asset "EBI:GAKDQIKUCRYB4OT7OJYZNNCHH5GKGKITUTXSZD77AY3LODSZGPP3YNB6" \
    --secret-key SBMQTWLUE2QGUKK6CNVQBBWWVJYL2UC4ZC5NSIZ4S53PLQP4O5UENW6K \
    --rpc-url http://localhost:8000/soroban/rpc \
    --network-passphrase 'Test SDF Future Network ; October 2022'
```

- Associated Token Program ID after wrapping the classic stellar token to the soroban environment: 728df6266b618d35c0d924d4e8f5ccbbc1304ad19cf1c6901de672ea849005d5 // Pass this token id in param of contract's method

- Invoke "hello" method of smart contract with soroban-cli // still dont know how to pass type "identifier" from CLI. // currently invoking functions using cargo test. // Next is to create web3-client for same.

```shell
# for reference purpose
soroban invoke \
    --id 60115eb0f28ded5ecfc47008d58ddd8a352f9aefb8e44e62a181e0a579c0b4df \
    --secret-key SBFQBFIDHAVLX6TLU5BJWAPGI6DZGRTVHVOL4YFHXYNTK53ZR6ASH4FU \
    --rpc-url http://localhost:8000/soroban/rpc \
    --network-passphrase 'Standalone Network ; February 2017' \
    --fn initialize \
    --arg ReceiverVaultAccountIdentifier 50 0f77c830f314991d648dd36f2ea20324fbf632f67c08ca549077d587e689f930
    --arg-xdr "$TOKEN_ADMIN_IDENTIFIER" \
    --arg "50" \
    --arg "0f77c830f314991d648dd36f2ea20324fbf632f67c08ca549077d587e689f930" \
```

### Stellar Blockchain Fixed Operation Types

export type OperationType =

- CreateAccount
- Payment
- PathPaymentStrictReceive
- PathPaymentStrictSend
- CreatePassiveSellOffer
- ManageSellOffer
- ManageBuyOffer
- SetOptions
- ChangeTrust
- AllowTrust
- AccountMerge
- Inflation
- ManageData
- BumpSequence
- CreateClaimableBalance
- ClaimClaimableBalance
- BeginSponsoringFutureReserves
- EndSponsoringFutureReserves
- RevokeSponsorship
- Clawback
- ClawbackClaimableBalance
- SetTrustLineFlags
- LiquidityPoolDeposit
- LiquidityPoolWithdraw
- **InvokeHostFunction**
  class HostFunction:
  - hostFnInvokeContract
  - hostFnCreateContractWithEd25519
  - hostFnCreateContractWithSourceAccount
  - hostFnCreateTokenContractWithSourceAccount
  - hostFnCreateTokenContractWithAsset

## PoC on Cross Program Invocation (CPI) in Soroban
- idea is to create a smart contract "hello_world" that invokes "mint" and "xfer" method of "token smart contract.
- there is a "testmint" method in "hello world" that should mint tokens to whosoever calls that method.
- In the first phase we are creating tokens in soroban itself rather than wrapping a classical asset.


### Phase 2 Developments
- when creating a vault, the borrower should have the optional ability to add some whitelist addresses of lenders that can only lent tokens to the vault_account
- Store difference time in smart contract, when borrower pays back after loan tenure. This timestamp should match the last installment payment time.
- Once the loan tenure is over, the amount of loan token deposited from the borrower can be taken back by the lender in proportion to the amount lent by them.
- check for gas fee differences to the end invoker when we increase no of vaults data in smart contract.