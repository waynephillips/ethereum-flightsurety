
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {
        DOM.elid('flight-number').value = 'WAYNEAIR007';
        DOM.elid('flight-number2').value = 'WAYNEAIR007';
        DOM.elid('airline-name').value = 'WAYNEAIR007';
        DOM.elid('airline-address').value = contract.airlines[1];
        DOM.elid('airline-fund').value = '10';
        DOM.elid('fund-airline-address').value = contract.airlines[1];
        DOM.elid('insurance-airline').value = contract.airlines[1];
        DOM.elid('insurance-flight').value = 'WAYNEAIR007';

        // Read transaction
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number2').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('register-airline').addEventListener('click', () => {
          let airlineAddress = DOM.elid('airline-address').value;
          let airlinename = DOM.elid('airline-name').value;
          contract.registerAirline(airlineAddress, airlinename, (error, result) => {
              display('Airlines', `Register Airline and Check Status`, [ { label: 'Register Airline: ', error: error, value: result.statusmessage} ]);
          });
        })

        DOM.elid('fund-airline').addEventListener('click', () => {
          let airlineAddress = DOM.elid('fund-airline-address').value;
          let airlinefund = DOM.elid('airline-fund').value;
          contract.fundAirline(airlineAddress,airlinefund,(error, result) => {
              display('Airlines', `Add Funds to Airline`, [ { label: 'Funds added to airline: ', error: error, value: result.fund + ' wei' + '  ' + result.statusmessage} ]);
          });
        })

        // register flight section
        DOM.elid('register-flight').addEventListener('click', () => {
          let flightnumber = DOM.elid('flight-number').value;
          console.log("flight number to register = " + flightnumber);
          contract.registerFlight(flightnumber, (error, result) => {
              display('Flights', `Register Flight`, [ { label: 'Register Flight Result: ', error: error, value: JSON.stringify(result)} ]);
          });
        })

        // buy insurance section
        DOM.elid('buy-insurance').addEventListener('click', () => {
          let airlineAddress = DOM.elid('insurance-airline').value;
          let flight = DOM.elid('insurance-flight').value;
          let amount = DOM.elid('insurance-amount').value;

          contract.buyInsurance(flight, airlineAddress, amount, (error, result) => {
              display('Passengers', `Have Passenger Purchase Insurance`, [ { label: 'Buy Insurance Result: ', error: error, value: JSON.stringify(result)} ]);
          });
        })

        DOM.elid('withdraw-insurance').addEventListener('click', () => {
          let airlineAddress = DOM.elid('insurance-airline').value;
          let flight = DOM.elid('insurance-flight').value;

          contract.withdrawInsurancePayout((error, result) => {
              display('Passengers', `Have Passenger Withdraw Insurance Payout`, [ { label: 'Insurance Withdrawn Result: ', error: error, value: JSON.stringify(result)} ]);
          });
        })

        // verify insurance
        DOM.elid('verify-insurance').addEventListener('click', () => {
          let airlineAddress = DOM.elid('insurance-airline').value;
          let flight = DOM.elid('insurance-flight').value;

          contract.fetchPassengerInsurancePayout((error, result) => {
              display('Passengers', `Verify Amount of Insurance Payout`, [ { label: 'Verify Insurance Result: ', error: error, value: result + ' wei'} ]);
          });
        })
    });


})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}
