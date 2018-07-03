# stormbreaker

## Overview 
CLI supporting basic functionality on VeChain Thor Blockchain. 

Explore the code to see how each function works and make it an executable script so you can interact with the testnet. 

Be sure you are running an instance of [thor](https://github.com/vechain/thor). 

#### Functionality

- account
    - creation
    - fund request (faucet)
    - balance inquires

- contract
    - deployment
    - function calls

- transaction
    - send ( two-party )
    - send ( multi-party )

#### Examples

Creating two accounts.
```
./stormbreaker.js create MyVeChainAccount
created account for testnet and saving to ./MyVeChainAccount.json
saved MyVeChainAccount.json

./stormbreaker.js create AnotherVeChainAccount
created account for testnet and saving to ./AnotherVeChainAccount.json
saved AnotherVeChainAccount.json

```

Querying the balance on an account
```
./stormbreaker.js request balance --account MyVeChainAccount
address: 0xb63A7a9Ec6461B14341aE535a0681420Df9eB4C1
requested balance for account MyVeChainAccount
0
```

Requesting funds from the faucet
```
./stormbreaker.js request funds --account MyVeChainAccount
address: 0xb63A7a9Ec6461B14341aE535a0681420Df9eB4C1
requested funds for account MyVeChainAccount

./stormbreaker.js request balance --account MyVeChainAccount
address: 0xb63A7a9Ec6461B14341aE535a0681420Df9eB4C1
requested balance for account MyVeChainAccount
5000000000000000000000

```

Sending funds to another account
```
./stormbreaker.js send 1000000 --to AnotherVeChainAccount --from MyVeChainAccount --data "How does it feel to be a millionaire?"
0x126b3796004d9ab6189a41d67fe1955a505f93e288476db840111c8c69deed00

./stormbreaker.js request balance --account MyVeChainAccount
address: 0xb63A7a9Ec6461B14341aE535a0681420Df9eB4C1
requested balance for account MyVeChainAccount
4999999999999999000000

./stormbreaker.js request balance --account AnotherVeChainAccount
address: 0xE5B357EC630867D68EF9B173f2c16c31485120eB
requested balance for account AnotherVeChainAccount
1000000
```

Deploying a very simple contract
```
./stormbreaker.js deploy HelloVeChain --from MyVeChainAccount
/// the transaction details will be displayed
/// get the contract address
contractAddress: '0x51c2c5b760d64757d4921a8ce0c50d7321f94b59'
```

Call a pure function on the contract
```
./stormbreaker.js call HelloVeChain --from MyVeChainAccount --function renderVeChainWorld --address 0x51c2c5b760d64757d4921a8ce0c50d7321f94b59
Hello VeChain!
```

### Contact Information
Join me on [Discord](https://discordapp.com/invite/HHvXvUX) for questions and discussions.