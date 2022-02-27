
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
        await config.flightSuretyApp.registerAirline(newAirline, "wayneair 1",{from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('(airline) only existing airline may register a new airline until there are at least four airlines registered.', async () => {
    //TODO:
     // ARRANGE
    // Register and Fund two airlines

    await config.flightSuretyData.fund(accounts[2], {from: accounts[0],value: web3.utils.toWei('10', "ether")});
    await config.flightSuretyApp.registerAirline(accounts[3], "wayneair 2",{from: config.firstAirline});
    await config.flightSuretyApp.registerAirline(accounts[4], "wayneair 3",{from: config.firstAirline});
    await config.flightSuretyApp.registerAirline(accounts[5], "wayneair 4",{from: config.firstAirline});
    await config.flightSuretyData.fund(accounts[3],{from: accounts[3],value: web3.utils.toWei('10', "ether")});
    await config.flightSuretyData.fund(accounts[4],{from: accounts[4],value: web3.utils.toWei('10', "ether")});
    await config.flightSuretyData.fund(accounts[5],{from: accounts[5],value: web3.utils.toWei('10', "ether")});
    // ACT
    await config.flightSuretyApp.registerAirline(accounts[6], "wayneair 5",{from:  accounts[1]});


    let result = await config.flightSuretyData.isAirlineRegistered.call(accounts[6]);
    //let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, true, "only existing and funded airline can register another airline.");
  });

  it('(airline) registration of 5th and subesequent airlines requires multi-party consensus of 50% of registered airlines.', async () => {
    //TODO:
    // ARRANGE
    // Register and Fund two airlines
    await config.flightSuretyData.fund(accounts[4],{from: accounts[4],value: web3.utils.toWei('10', "ether")});

    // ACT
    try {
        let reg_result = await config.flightSuretyApp.registerAirline(accounts[7], "wayneair 6",{from:  accounts[4]});
    }
    catch(e) {
      console.log(e);
    }

    let result = await config.flightSuretyApp.isAirlineRegistered.call(accounts[7]);


    // ASSERT
    assert.equal(result, false, "airline cannot be registered until it is approved by 50% consensus.");

    try {
        await config.flightSuretyApp.registerAirline(accounts[7], "wayneair 7",{from:  accounts[1]});
        await config.flightSuretyApp.registerAirline(accounts[8], "wayneair 8",{from:  accounts[3]});
        await config.flightSuretyApp.registerAirline(accounts[9], "wayneair 9",{from:  accounts[4]});
    }
    catch(e) {
    }
    result = await config.flightSuretyData.isAirlineRegistered.call(accounts[7]);

    // ASSERT
    assert.equal(result, true, "airline is now registered because 50% consensus has been reached.");

  });

  it('(airline) airline can be registered, but it does not participate in contract until it submits funding of 10 ether.', async () => {
    //TODO:
  });
});
