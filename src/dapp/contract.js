import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];

        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        //this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.appContractAddress = config.appAddress;
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    async initialize(callback) {
        if (window.ethereum) {
          try {
              this.web3 = new Web3(window.ethereum);
              // Request account access
              await window.ethereum.enable();
          } catch (error) {
              console.log(error);
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
            let counter = 2;

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            //authorize AppContract to call DataContract
            this.flightSuretyData.methods.authorizeContract(this.appContractAddress).send({from: this.owner}, (error, result) => {
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
    registerAirline(airlineaddress,airlinename,callback) {
        let self = this;

        let payload = {
              airline: airlineaddress,
              flight: airlinename,
              registered: false,
              statusmessage : ""
        }

        self.flightSuretyApp.methods
            .registerAirline(payload.airline,payload.flight)
            .send({ from: self.owner,
              gas: 5000000,
              gasPrice: 20000000},
               (error,result) => {
              if (error) {
                  console.log(error);
                  callback (error,payload);
                }
                else {
                  self.flightSuretyData.methods
                  .isAirlineRegistered(payload.airline).call({from: self.owner}, (error,result) => {
                        payload.statusmessage = "Airline has been registered";
                        payload.registered = true;
                        callback(error,payload);
                  })
                }
            });
    }
    fundAirline(airlineaddress, amount, callback) {
        let self = this;
        let amountInWei = this.web3.utils.toWei(amount.toString(), "ether").toString();
        let payload = {
              airline: airlineaddress,
              fund: amountInWei,
              hasfunds: false,
              statusmessage : ""
        }
        self.flightSuretyData.methods
            .fund(payload.airline)
            .send({ from: this.owner, value: payload.fund }, (error, result) => {
                if (error) { callback (error,payload); }
                else {
                  self.flightSuretyData.methods
                  .isAirline(payload.airline).call({from: self.owner}, (error,result) => {
                        payload.statusmessage = "Airline has funds, Registered and Avaliable to Vote";
                        payload.hasfunds = true;
                        callback(error,payload);
                  })
                }
            });
    }
    registerFlight(flightNumber, callback) {
        let self = this;
        let payload = {
            flight: flightNumber,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .registerFlight(payload.flight, payload.timestamp)
            .send({ from: this.owner,
              gas: 5000000,
              gasPrice: 20000000 }, (error, result) => {
                callback(error, result);
            });
    }
    fetchAirline(airlineaddress, callback) {
        let self = this;
        let payload = {
            airline: airlineaddress
        }
        self.flightSuretyData.methods.getAirline(payload.airline)
        .call({ from: this.owner })
        .then(function(result) {
            console.log( `Registered: ${result.registered}. Has Funds: ${result.hasfunds}. Name: ${result.name}. funds: ${result.funds}. NumVotes: ${result.numVotes}. NumAirlines: ${result.numairlines}`);
            callback(result)
          });
    }
    fetchPassenger(callback) {
      //contractInstance.methods.getIdentifier().call().then (x => {/* use x here */});
        let self = this;
        let payload = {
          passenger: this.owner
        }
        self.flightSuretyData.methods
            .getPassenger(this.owner)
            .send({ from: this.owner }, (error, result) => {
                callback(error, result);
            });
    }
    buyInsurance(flightNumber, airlineaddress, amount, callback) {
        let self = this;

        let payload = {
            flight: flightNumber,
            airline: airlineaddress,
            amount: self.web3.utils.toWei(amount.toString(), "ether").toString(),
            timestamp: Math.floor(Date.now() / 1000)
        }
        console.log(payload);
        self.flightSuretyData.methods
            .buy(payload.airline,payload.flight,payload.timestamp)
            .send({ from: this.owner, value: payload.amount,
              gas: 5000000,
              gasPrice: 20000000 }, (error, result) => {
                callback(error, result);
            });
    }

    fetchPassengerInsurancePayout(callback) {
        let self = this;
        let payload = {
          passenger: this.owner,
          statusmessage: "",
          insurancepayout: 0
        }
        self.flightSuretyData.methods
            .getPassengerInsurancePayout(this.owner)
            .call({ from: this.owner },(error,result) => {
                callback(error,result);
            });
    }
    withdrawInsurancePayout(callback) {
        let self = this;
        self.flightSuretyData.methods
          .pay(this.owner)
          .send({ from: this.owner }, (error, result) => {
            callback(error, result);
        });
    }

    getFlightStatus(flightname, callback) {
      let self = this;
      let payload = {
          flight: flightname,
          timestamp: Math.floor(Date.now() / 1000)
      }

      self.flightSuretyApp.methods
          .getFlightStatus(payload.flight, payload.timestamp)
          .call({from:this.owner}, callback);
  }
}
