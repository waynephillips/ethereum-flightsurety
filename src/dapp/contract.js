import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        //this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        if (window.ethereum) {
          try {
              this.web3 = new Web3(window.ethereum);
              // Request account access
              await window.ethereum.enable();
          } catch (error) {
              // User denied account access...
              console.error("User denied account access")
          }
        }
        if (typeof this.web3 == "undefined") {
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
            console.log("local ganache provider");
        }
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];
            this.firstAirline = accts[1];
           // this.fundAirline(this.firstAirline,this.web3.utils.toWei('10', "ether"),(error,result) => {
           // })

           console.log("accts[0] = " + accts[0]);
           console.log("firstairline = " + accts[1]);
            let counter = 2;

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            //authorize AppContract to call DataContract
            this.flightSuretyData.methods.authorizeContract(config.appAddress).send({from: self.owner}, (error, result) => {
              if(error) {
                  console.log("Could not authorize the App contract");
                  console.log(error);
              }
          });

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
      /*
      self.flightSuretyApp.methods
          .registerAirline(airline,airlinename)
          .send({ from: this.owner}, (error, result) => {
              callback(error, result);
          }); */
      self.flightSuretyApp.methods
          .registerAirline(airline,airlinename)
          .call({ from: self.owner}, callback);
    }
    fundAirline(airline, amount, callback) {
        let self = this;
        //let amountInWei = self.web3.utils.toWei(amount, "ether").toString();

        self.flightSuretyData.methods
            .fund(airline)
            .send({ from: this.owner, value: amount ,gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    registerFlight(flightNumber, callback) {
        let self = this;
        console.log('registerFlight with account', this.owner);
        let timestamp = Math.floor(Date.now() / 1000)
        self.flightSuretyApp.methods
            .registerFlight(flightNumber, timestamp)
            .send({ from: this.owner, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    fetchAirline(callback) {
      let self = this;
        console.log('fetchAirline with account', this.owner);
        self.flightSuretyData.methods
            .getAirline(self.account)
            .send({ from: this.owner, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    fetchPassenger(callback) {
      let self = this;
        console.log('fetchPassenger with account', this.owner);
        self.flightSuretyData.methods
            .getPassenger(self.account)
            .send({ from: this.owner, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    buyInsurance(flightNumber, airline, amount, callback) {
        let self = this;
        console.log('buyInsurance for ', this.owner);
        let timestamp = Math.floor(Date.now() / 1000)
        let amountInWei = self.web3.utils.toWei(amount, "ether").toString();
        self.flightSuretyData.methods
            .buy(airline,flightNumber,timestamp)
            .send({ from: this.owner, value: amountInWei, gas: 999999999 }, (error, result) => {
                callback(error, result);
            });
    }
    withdrawInsurancePayout(callback) {
        let self = this;
        self.flightSuretyData.methods
          .pay(self.account)
          .send({ from: this.owner, gas: 999999999 }, (error, result) => {
            callback(error, result);
        });
    }
}
