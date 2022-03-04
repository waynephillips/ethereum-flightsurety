import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let w3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http','ws')));
w3.eth.defaultAccount = w3.eth.accounts[0];
const gasPrice = 20000000000;
const gas = 6721975;
// w3.eth.getGasPrice().then((res) => {gas = res});
let flightSuretyApp = new w3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;
const ORACLE_NUMBER = 20;
let status = [
  STATUS_CODE_UNKNOWN,
  STATUS_CODE_ON_TIME,
  STATUS_CODE_LATE_AIRLINE,
  STATUS_CODE_LATE_WEATHER,
  STATUS_CODE_LATE_TECHNICAL,
  STATUS_CODE_LATE_OTHER
]
let REGISTRATION_FEE = 0;
let accounts = [];
let oracles = [];

// Initialization
flightSuretyApp.methods.getOracleRegistrationFee().call({from:w3.eth.defaultAccount}).then((result) => {
  REGISTRATION_FEE = result;
  console.log(REGISTRATION_FEE);
})

w3.eth.getAccounts().then((result, error) => {
  accounts = result;
  console.log(accounts);
  if (error) console.log(error);
  for (let i = 20; i < 20 + ORACLE_NUMBER; i++) {
    oracles.push(accounts[i]);
    flightSuretyApp.methods.registerOracle().send({from:accounts[i], value: REGISTRATION_FEE, gas:gas}).then(() => {
      flightSuretyApp.methods.getMyIndexes().call({from:accounts[i]}).then((result, error) => {
        console.log(result);
      })
    })
  }
  console.log(oracles);
});

flightSuretyApp.events.OracleRequest((error, event) => {
    if (error) console.log(error)
    console.log(event)

    // Define a random oracle response
    let response = status[0];
    let dice = Math.random();

    if (dice <= 0.01) response = status[0];
    else if (dice <= 0.4) response = status[1];
    else if (dice <= 0.5) response = status[2];
    else if (dice <= 0.8) response = status[3];
    else if (dice <= 0.9) response = status[4];
    else response = status[5];

    for (let i=0; i<oracles.length; i++) {
      flightSuretyApp.methods.getMyIndexes().call({from:oracles[i]}).then((res, err) => {
        for (let j=0; j<res.length; j++) {
          if (res[j] == event.returnValues.index) {
            flightSuretyApp.methods.submitOracleResponse(
              res[j],
              event.returnValues.airline,
              event.returnValues.flight,
              event.returnValues.timestamp,
              response
            ).send({from:oracles[i], gas:gas}).then((res, err) => {
              if (err) console.log(err);
            })
            break;
          }
        }
      })
    }

});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;
