#!/usr/bin/env node
const thorify = require("thorify");
const Web3 = require("web3");
const fs = require('fs');
const program = require('commander');
const path = require('path');
const axios = require('axios');
const solc = require('solc');
const web3 = new Web3();
thorify.thorify(web3, "http://localhost:8669");

program
  .version('0.1.0');

program
  .command('create <account>')
  .description('create an address on vechain testnet')
  .action(function(account,cmd){
    createAccount(account)
  });

program
  .command('request [type]')
  .description('make a request of the given type for an account')
  .option("-a, --account <account_name>")
  .action(function(type, options){

    if(type === 'funds')
    {
      requestFunds(options.account);
    }

    if(type === 'balance')
    {
      requestBalance(options.account);
    }

    if(type === 'energy')
    {
      requestEnergy(options.account);
    }

    console.log(`requested ${type} for account ${options.account}`);

  });

program
  .command('send <amount>')
  .description('make a request of the given type for an account')
  .option("-to, --to <account_name>")
  .option("-from, --from <account_name>")
  .option("-data, --data [message]")
  .action(sendFunds);

program
  .command('deploy <contract>')
  .description('deploy a .sol contract')
  .option("-from, --from <account_name>")
  .action(deployContract);

program
  .command('call <contract>')
  .description('call a pure function on a deployed contract')
  .option("-from, --from <account_name>")
  .option("-function, --function <function_name")
  .option("-address, --address <contract_address>")
  .action(callContract);

function callContract(contract, options){
  if(contract === undefined){
    console.error(`contract is undefined`);
  }

  if(options.from === undefined){
    console.error(`from is undefined`);
  }

  if(options.function === undefined){
    console.error(`function is undefined`);
  }

  if(options.address === undefined){
    console.error(`address is undefined`);
  }

  if(!doesAccountExist(options.from))
  {
    console.error(`from account does not exist`);
  }

  if(!fs.existsSync(`./${contract}.sol`))
  {
    console.error(`contract does not exist`);
  }

  let from = loadAccount(options.from);

  web3.eth.accounts.wallet.add(from.privateKey);

  let rawContract = fs.readFileSync(`./${contract}.sol`);

  let compiledContract = solc.compile(rawContract.toString(),1);
  
  let contractByteCode = compiledContract.contracts[`:${contract}`].bytecode;

  let abi = JSON.parse(compiledContract.contracts[`:${contract}`].interface);

  let contractObject = new web3.eth.Contract(abi,options.address);

  contractObject
    .methods[`${options.function}`]()
    .call((error, result)=>{
      if(error)
      {
        console.log(error);
        return;
      }

      console.log(result);
    });

}

function deployContract(contract, options){
  if(contract === undefined){
    console.error(`contract is undefined`);
  }

  if(options.from === undefined){
    console.error(`from is undefined`);
  }

  if(!doesAccountExist(options.from))
  {
    console.error(`from account does not exist`);
  }

  if(!fs.existsSync(`./${contract}.sol`))
  {
    console.error(`contract does not exist`);
  }

  let from = loadAccount(options.from);

  web3.eth.accounts.wallet.add(from.privateKey);

  let rawContract = fs.readFileSync(`./${contract}.sol`);

  let compiledContract = solc.compile(rawContract.toString(),1);
  
  let contractByteCode = compiledContract.contracts[`:${contract}`].bytecode;

  let abi = JSON.parse(compiledContract.contracts[`:${contract}`].interface);

  let contractObject = new web3.eth.Contract(abi);

  contractObject
    .deploy({
      data: '0x' + contractByteCode
    })
    .send({
      from: from.address,
      gas: '4700000',
      gasPrice: '30000000000000'
    },(error, transactionHash) => {
      if(error){
        console.log(error.toString());
        return;
      }

      console.log(transactionHash);
    })
    .on('error', function(error){
      console.log("error= " + error.toString());
    })
    .on('transactionHash', function(transactionHash){
        console.log("transactionHash= " + transactionHash.toString());
    })
    .on('receipt', function(receipt){
        console.log(receipt.contractAddress) // contains the new contract address
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log(confirmationNumber);
      console.log(receipt);
    })
    .then(function(newContractInstance){
        console.log(newContractInstance.options.address); // instance with the new contract address
    });
}

function sendFunds(amount, options){
  if(amount === undefined){
    console.error(`amount is undefined`);
  }

  if(options.from === undefined){
    console.error(`from is undefined`);
  }

  if(options.from === undefined){
    console.error(`from is undefined`);
  }

  if(!doesAccountExist(options.from))
  {
    console.error(`from account does not exist`);
  }

  if(!doesAccountExist(options.to))
  {
    console.error(`to account does not exist`);
  }

  let from = loadAccount(options.from);
  let to = loadAccount(options.to);

  web3.eth.accounts.wallet.add(from.privateKey);

  web3.eth.sendTransaction({
     from: from.address,
     to: to.address,
     value: amount,
     data: '0x' + Buffer.from(options.data,'ascii').toString('hex')
  },(error, result) =>{
    if(error){
      console.error(error);
    }
    else{
      console.log(result);
    }
  });
}

function createAccount(accountName) {

  if(doesAccountExist(accountName))
  {
    console.error(`${accountName} already exists in ${accountName}.json`);
    return;
  }

  var results = {
    account: null
  }

  results.account = web3.eth.accounts.create();

  console.log(`created account for testnet and saving to ./${accountName}.json`);

  saveObjectAsJSON(results.account, accountName);

  console.log(`saved ${accountName}.json`);
}

function requestFunds(accountName){

  if(!doesAccountExist(accountName))
  {
    console.error(`${accountName}.json does not exist`)
    return;
  }

  let account = loadAccount(accountName);

  console.log(`address: ${account.address}`)

  let data = {
    to: account.address
  };

  saveObjectAsJSON(data,`${accountName}.requestfunds.data`);

  axios
    .post('https://faucet.outofgas.io/requests',data)
    .then(function(response){
      saveObjectAsJSON(response,`${accountName}.requestfunds.response`);
    })
    .catch(function(error){
      if(error && error.response)
      saveObjectAsJSON({status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
        message: error.message},`${accountName}.requestfunds.error`);
    });
}

function requestBalance(accountName){

  if(!doesAccountExist(accountName))
  {
    console.error(`${accountName}.json does not exist`)
    return;
  }

  let account = loadAccount(accountName);

  console.log(`address: ${account.address}`)

  web3.eth
  .getBalance(`${account.address}`,"latest")
  .then(result => {
    console.log(result);
  })
  .catch(function(error){
    console.log(error);
    if(error && error.response)
    saveObjectAsJSON({status: error.response.status,
      headers: error.response.headers,
      data: error.response.data,
      message: error.message},`${accountName}.requestbalance.error`);
  });
}

function requestEnergy(accountName){

  if(!doesAccountExist(accountName))
  {
    console.error(`${accountName}.json does not exist`)
    return;
  }

  let account = loadAccount(accountName);

  console.log(`address: ${account.address}`)

  web3.eth
  .getEnergy(`${account.address}`,"latest")
  .then(result => {
    console.log(result);
  });
}

function doesAccountExist(accountName) {
  return fs.existsSync(`./${accountName}.json`);
}

function loadAccount(accountName) {
  return JSON.parse(fs.readFileSync(`./${accountName}.json`));
}

function saveObjectAsJSON(object, filename)
{
  fs.writeFileSync(`./${filename}.json`, JSON.stringify(object));
}

program.parse(process.argv);
