import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
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

function createRandomNumber() {
  return Math.random();
}

web3.eth.getAccounts((error, accounts) => {
  for (let i = 0; i<20; i++){
      oracles.push(accounts[i]);
      flightSuretyApp.methods.registerOracle().send({ from:accounts[i], value: web3.utils.toWei("1", "ether"),gas:3000000 }).then(()=>
      flightSuretyApp.methods.getMyIndexes().call({from: accounts[i]}).then((result,error) =>
      {
        console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]} from Account: ${accounts[i]}`)
      }
    ));
}});

flightSuretyApp.events.FlightStatusInfo((error,event) => {
  console.log("FlightStatusInfo event : flight = " +  event.returnValues.flight + ' status = ' + event.returnValues.status);
});

flightSuretyApp.events.OracleRequest((error, event) => {
  if (error) console.log(error)
  console.log('OracleRequest Event : ' + event);
  // extract event data for contract call
  let { index, airline, flight, timestamp } = event.returnValues;
  console.log('=================================================');
  console.log(`[IncomingRequest] index=${index}, airline=${airline}, flight=${flight}, timestamp=${timestamp}`);

  let flightstatus = STATUS_CODES.LATE_OTHER;
  let oraclresponse = createRandomNumber();
  if (oraclresponse <= 0.6) flightstatus = STATUS_CODES.ON_TIME;
  else if (oraclresponse <= 0.7) flightstatus =STATUS_CODES.LATE_AIRLINE;
  else if (oraclresponse <= 0.8) flightstatus = STATUS_CODES.LATE_WEATHER;
  else if (oraclresponse <= 0.9) flightstatus = STATUS_CODES.LATE_TECHNICAL;
  else flightstatus = STATUS_CODES.LATE_OTHER;

  for (let i=0; i<oracles.length; i++) {
    flightSuretyApp.methods.getMyIndexes().call({from:oracles[i]}).then((index, error) => {
      for (let j=0; j<index.length; j++) {
        if (index[j] == event.returnValues.index) {
          flightSuretyApp.methods.submitOracleResponse(
            event.returnValues.index,
            event.returnValues.airline,
            event.returnValues.flight,
            event.returnValues.timestamp,
            flightstatus).send({
            from: oracles[i], gas: 5000000},(error, result)=>{
              if (error) console.log(error);
            });
          //break;
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
