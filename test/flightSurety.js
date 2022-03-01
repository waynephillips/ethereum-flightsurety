
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
var Web3 = require('web3');
contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {

    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, "wayneair 2",{from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    // firstairline was registered, but it was not funded with 10 ether, so result should be false
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('(airline) only existing airline(s) may register a new airline until there are at least four airlines registered.', async () => {

    try {
       // ARRANGE
        // Register and Fund two airlines
        await config.flightSuretyData.fund(accounts[2], {from: accounts[2],value: web3.utils.toWei('10', "ether")});
        await config.flightSuretyApp.registerAirline(accounts[3], "wayneair 3",{from: accounts[2]});
        await config.flightSuretyApp.registerAirline(accounts[4], "wayneair 4",{from: accounts[2]});
        await config.flightSuretyData.fund(accounts[3],{from: accounts[3],value: web3.utils.toWei('10', "ether")});
        await config.flightSuretyData.fund(accounts[4],{from: accounts[4],value: web3.utils.toWei('10', "ether")});
    }
    catch (e)
    {
      console.log("error in only exist airlines " + e);
    }
    // ACT   - confirm that the last airline registered by account 2 is really registered
    let result = await config.flightSuretyData.getAirline(accounts[4]);

    // ASSERT
    assert.equal(result[0], true, "only existing and funded airline can register another airline.");
  });

  it('(airline) airline can provide funds (10 ether) to participate in contracts and be fully registered.', async () => {

    // ARRANGE
    let fundamount = web3.utils.toWei('10', 'ether');
    // ACT

    await config.flightSuretyData.fund(config.firstAirline,{ from: config.firstAirline, value: fundamount });
    let result = await config.flightSuretyData.getAirline(config.firstAirline);

    // ASSERT
    assert.equal(result[3].toString(), fundamount.toString(), "airline was not funded with 10 ether.");
});
  it('(airline) registration of 5th and subesequent airlines requires multi-party consensus of 50% of registered airlines.', async () => {
    // ARRANGE
        let airline5 = accounts[5];
        let airline6 = accounts[6];
        let airline7 = accounts[7];
        let airline8 = accounts[8];

          //register and fund 3 airlines
          await config.flightSuretyApp.registerAirline(airline5,"wayne air 5", {from:config.firstAirline});
          await config.flightSuretyData.fund(airline5,{from:airline5, value: web3.utils.toWei('10', "ether")});
          await config.flightSuretyApp.registerAirline(airline6, "wayne air 6", {from:accounts[2]});
          await config.flightSuretyData.fund(airline6,{from:airline6, value: web3.utils.toWei('10', "ether")});
          await config.flightSuretyApp.registerAirline(airline7, "wayne air 7",{from:accounts[2]});
          await config.flightSuretyData.fund(airline7,{from:airline7, value: web3.utils.toWei('10', "ether")});

          // need 2 airlines to register and vote for airline8, this should achieve the 50% consensus
          await config.flightSuretyApp.registerAirline(airline8, "wayne air 8", {from:airline6});
          await config.flightSuretyApp.registerAirline(airline8, "wayne air 8", {from:airline7});

        // assert
        let result = await config.flightSuretyData.getAirline(airline8);
        assert.equal(result[0], true, "two different airlines should be able to register another new airline - 50% consensus");

  });

  it('(airline) airline can be registered, but it does not participate in contract until it submits funding of 10 ether.', async () => {
    let newAirline = accounts[9];
    try {
        await config.flightSuretyApp.registerAirline(newAirline, "wayneair 9",{from:  config.firstAirline});
    }
    catch (e){
    }
    result = await config.flightSuretyData.getAirline(newAirline);

     // ASSERT
     assert.equal(result[1], false, "airline not able to participate in contract because no funds.");
  });

  it('(airline) airline may pay 10 ether and participate in contract', async () => {
    let firstAirline = accounts[1];
    let newAirline = accounts[10];
    fundamount = web3.utils.toWei('10', "ether");
    try {
        // fund first airline because it should have no funds
        await config.flightSuretyData.fund(config.firstAirline,{from: config.firstAirline,value: web3.utils.toWei('10', "ether")});
        // now first airline should be able to register a new airline.
        await config.flightSuretyApp.registerAirline(newAirline, "wayneair 10",{from:  firstAirline});
    }
    catch (e){
    }
    result = await config.flightSuretyData.getAirline(config.firstAirline);
     // ASSERT
     assert.equal(result[1] , true, "airline not able to participate in contract because no funds.");
  });

  it('(passenger) passenger(s) may pay up to 1 ether for purchasing flight insurance.', async () => {
    // ACT
    let flightTimestamp = Math.floor(Date.now() / 1000);
    fundamount = web3.utils.toWei('1', "ether");
    try {
        await config.flightSuretyData.buy(config.firstAirline,"wayneair 1",flightTimestamp, {from: accounts[10], value: fundamount});
    }
    catch(e) {
        console.log(e);
    }

    let passenger = await config.flightSuretyData.getPassenger(accounts[10]);
    assert.equal(passenger[0], true, "passenger record should show they purchased insurance.");

  });
});
