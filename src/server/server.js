import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

const STATUS_CODES = {
  UNKNOWN: 0,
  ON_TIME: 10,
  LATE_AIRLINE: 20,
  LATE_WEATHER: 30,
  LATE_TECHNICAL: 40,
  LATE_OTHER: 50
};
let accounts = [];
let oracles = [];

function registerEventsListener() {
  flightSuretyApp.events.DebuggerEvent({}, debuggerEventListener)
  flightSuretyApp.events.FlightStatusInfo({}, flightStatusInfoListener);
  flightSuretyApp.events.OracleReport({}, oracleReportListener);
  flightSuretyApp.events.OracleRegistered({}, oracleRegisteredListener);
  flightSuretyApp.events.OracleRequest({}, oracleRequestListener);
}
function createRandomNumber() {
  return Math.floor(Math.random() * 9);
}

async function registerOracles(){
    const REGISTRATION_FEE = await flightSuretyApp.methods.REGISTRATION_FEE().call();
    let accounts = await web3.eth.getAccounts();
    let numOracles = 20;
    if (accounts.length < numOracles) {
      numOracles = accounts.length;
    }
    for (let i = 0; i < numberOfOracles; i++) {
        oracles.push(accounts[i]);
        await flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: web3.utils.toWei("1", "ether"), gas: 5000000 }, (error, res) => {
        })
    }
}

async function submitOracleResponse(airline, flight, timestamp) {
  for (let i = 0; i < oracles.length; i++) {
    let statusCode = createRandomNumber() * 10;
    let indexes = await flightSuretyApp.methods.getMyIndexes().call({ from: oracles[i] });
    for (let j = 0; j < indexes.length; j++) {
      try {
        await flightSuretyApp.methods.submitOracleResponse( indexes[j], airline, flight, timestamp, statusCode).send({
          from: oracles[i],
          gas: 5000000,
          gasPrice: 20000000000
        });
      } catch (error) {
        console.log('submitOracleResponse Error => ' + error);
      }
    }
  }
}
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (!error) {
      await submitOracleResponse(
        contractEvent.returnValues[1], // airline
        contractEvent.returnValues[2], // flight
        contractEvent.returnValues[3] // timestamp
      );
    }
    console.log(event)
});

registerOracles();
const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})
export default app;
