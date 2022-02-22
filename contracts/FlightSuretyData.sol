// SPDX-License-Identifier: MIT
pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    uint constant AIRLINE_FUND_AMOUNT = 10;
    uint constant INSURANCE_FUND_AMOUNT = 1;
    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    uint constant M = 3;   // min number of multi-party voters
    uint private numVoted = 0;
    address[] multiCalls = new address[](0);  // all of the addresses that have called the multi-party consensus function
    struct Passenger {
        bool purchasedInsurance;
        address wallet;
        uint256 insurancePaid;
        uint256 insurancePayout;
    }
    mapping(bytes32 => Passenger[]) private passengers;

    struct UserProfile {
      bool isRegistered;
      bool isAdmin;
    }
    mapping(address => UserProfile) userProfiles;
    struct Airline {
      bool isRegistered;
      uint numVotes;
      bool hasFunds;
      string name;
      address wallet;
      uint256 funds;
    }
    mapping(address => Airline) airlines;     // store registered airlines
    mapping(address => uint256) private authorizedContracts;            // list of authorized contracts that can call this data contract
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                  string airlinename
                                )
                                public
    {
        contractOwner = msg.sender;
        // register the first airline
        airlines[msg.sender] = Airline({name: airlinename,
                      isRegistered:true,
                      hasFunds: false,
                      numVotes: 0,
                      wallet: msg.sender});

    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // need to ensure that the calling contract is authorized
    modifier requireIsCallerAuthorized()
    {
        require(authorizedContracts[msg.sender] == 1, "Caller is not contract owner");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/
    /**
    * @dev Check if a user is registered
    *
    * @return A bool that indicates if the user is registered
    */
    function isUserRegistered
                            (
                                address account
                            )
                            external
                            view
                            returns(bool)
    {
        require(account != address(0), "'account' must be a valid address.");
        return userProfiles[account].isRegistered;
    }

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return operational;
    }

    function registerUser
                                (
                                    address account,
                                    bool isAdmin
                                )
                                external
                                requireIsOperational
                                requireContractOwner
    {
        require(!userProfiles[account].isRegistered, "User is already registered.");

        userProfiles[account] = UserProfile({
                                                isRegistered: true,
                                                isAdmin: isAdmin
                                            });
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
                            (
                                bool mode
                            )
                            external
                            requireContractOwner
    {
        require(mode != operational,"New mode must be different from existing mode");
        require(userProfiles[msg.sender].isAdmin,"Caller is not an admin");
        bool isDuplicate = false;
        for (uint c=0; c=multiCalls.length; c++) {
          if (multiCalls[c] == msg.sender) {
            isDuplicate = true;
            break;
          }
        }
        require(!isDuplicate,"Caller has already called this function");
        multiCalls.push(msg.sender);
        if (multiCalls.length >= M) {
          operational = mode;
          multiCalls = new address[](0);
        }
    }

    // authorize the calling contract(s) to restrict data contract callers
    function authorizeContract
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        authorizedContracts[contractAddress] = 1;
    }

    // deauthorize the calling contract
    function deauthorizeContract
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }
    function isAirlineRegistered
        (
          address account
        )
        external
        view
        returns(bool)
    {
      require(account != address(0),"'airline' must be a valid address");
      return airlines[account].isRegistered;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline
                            (
                              address account
                            )
                            external
                            pure
    {
        // remove pure once code is written
        require(!airlines[account].isRegistered,"Airlines is already registered.");
        if (airlines.length < M) {
          airlines[account] = Airline({
            isRegistered: true,
            wallet: account
          });
        } else {
            airlines[account].numVotes++;
            if (airlines[account].numVotes >= M) {
              airlines[account].isRegistered = true;
            }
        }
    }


   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                            (
                              address airline,
                              string memory flight,
                              uint256 timestamp
                            )
                            external
                            payable
    {
      require(msg.value == INSURANCE_FUND_AMOUNT, "Insufficient funds to purchase flight insurance");
      require(msg.sender == tx.origin, "Unauthorized Contract");
      bytes32 flightkey = getFlightKey(airline,flight,timestamp);
      passengers[flightkey].push(Passenger({purchasedInsurance:true,
                  wallet: msg.sender,
                  insurancePaid: msg.value,
                  insurancePayout: 0}));


    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                              address account
                            )
                            external
                            payable
    {

      payable(account).transfer(msg.value);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                              address airline
                            )
                            public
                            payable
    {
      airlines[airline].funds.add(msg.value);
      // when airline has the required funds to Vote, set hasFunds to true
      if (airlines[airline].funds >= AIRLINE_FUND_AMOUNT) {
        airlines[airline].hasFunds = true;
      } else {
        airlines[airline].hasFunds = false;
      }
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund();
    }


}
