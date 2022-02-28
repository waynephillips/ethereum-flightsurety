# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Architecture Notes
Application is separated into 2 smart contracts
- FligtsuretyData.sol for data persistence
- FlightsuretyApp.sol for application logic and oracles code

Contract Features
- Ability to control operational status (that is active or not active)
- Where appropriate, functions will have require() call at the beginning to fail fast
- First airline will be registered when the contract is deployed
- Only existing airline(s) may register a new airline until there are at least four airlines registered.
  - Note: Truffle Test
- Airline can be registered, but does not participate in contract until it submits funding of 10 ether.
  - Note: Verify with Truffle Test
-
Dapp client
- Execute steps
  - npm run dapp
  - http://localhost:8000
- Capabilities
  - Passenger Airline Choice:
    - Passengers can choose from a fixed list of flight numbers and departures that are defined in the Dapp client
    - UI has the following capabilities
      - Fields for Airline Address and Airline Name
      - Amount of funds to send/which airline to send to
      - Ability to purchase flight insurance for no more than 1 ether
  - Passenger Payment
    - Passengers may pay up to 1 ether for purchasing flight insurance.
  - Passenger Repayment
    - If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid
    - Ability to trigger the contract to request flight status update (looking to see if there are flight delays that require insurance payout)
  - Passenger Withdraw
    - Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout
    - Insurance payouts are not sent directly to passenger’s wallet

Oracle Server App
- simulates the behaviour of an oracle(s).
- execute - npm run server


## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

note: requirements for project are verified by running the truffle tests. Dapp will showcase the basic functioality and data, but will not fully demonstrate all of the functionality of the 2 contracts.

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)
