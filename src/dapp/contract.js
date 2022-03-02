import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }
    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
    registerAirline(airline,airlinename,callback) {
      let self = this;
      self.flightSuretyApp.methods
          .registerAirline(airline,airlinename)
          .send({ from: self.account , gas: 999999999}, (error, result) => {
              callback(error, result);
          });
    }
    fundAirline(amount, callback) {
        let self = this;
        console.log('fundAirline with account', self.account);
        let amountInWei = self.web3.utils.toWei(amount, "ether").toString();
        self.flightSuretyData.methods
            .fund(self.account)
            .send({ from: self.account, value: amountInWei ,gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    registerFlight(flightNumber, callback) {
        let self = this;
        console.log('registerFlight with account', self.account);
        let timestamp = Math.floor(Date.now() / 1000)
        self.flightSuretyApp.methods
            .registerFlight(flightNumber, timestamp)
            .send({ from: self.account, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    fetchAirline(callback) {
      let self = this;
        console.log('fetchAirline with account', self.account);
        self.flightSuretyData.methods
            .getAirline(self.account)
            .send({ from: self.account, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    fetchPassenger(callback) {
      let self = this;
        console.log('fetchPassenger with account', self.account);
        self.flightSuretyData.methods
            .getPassenger(self.account)
            .send({ from: self.account, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    buyInsurance(flightNumber, airline, amount, callback) {
        let self = this;
        console.log('buyInsurance for ', self.account);
        let timestamp = Math.floor(Date.now() / 1000)
        let amountInWei = self.web3.utils.toWei(amount, "ether").toString();
        self.flightSuretyData.methods
            .buy(airline,flightNumber,timestamp)
            .send({ from: self.account, value: amountInWei, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    withdrawInsurancePayout(callback) {
        let self = this;
        self.flightSuretyData.methods
          .pay(self.account)
          .send({ from: self.account, gas: 999999999 }, (error, result) => {
            callback(error, result);
        });
    }
}
