
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
        DOM.elid('register-airline').addEventListener('click', () => {
          let airlineAddress = DOM.elid('airline-address').value;
          contract.registerAirline(airlineAddress, (error, result) => {
              // console.log('Registering airline ' + error.message);
              displaySimple([{ label: 'Registering airline', error: getErrorMessage(error), value: result }], "registration-display-wrapper");
          });
        })
        DOM.elid('fund').addEventListener('click', () => {
          let airlineAddress = DOM.elid('airline-address').value;
          contract.fundAirline((error, result) => {
              // displaySimple('Airline', 'fund', [{ label: 'fund airline', error: error, value: result.airline + ' ' + result.timestamp }]);
              displaySimple([{ label: 'Airline funding result', error: getErrorMessage(error), value: JSON.stringify(result) }], "funding-display-wrapper");
          });
        })

        DOM.elid('buy-insurance').addEventListener('click', () => {
          let airlineAddress = DOM.elid('insurance-airline').value;
          let flight = DOM.elid('insurance-flight').value;
          let amount = DOM.elid('insurance-amount').value;

          contract.buyInsurance(flight, airlineAddress, amount, (error, result) => {
              displaySimple([{ label: 'Buy Insurance', error: getErrorMessage(error), value: JSON.stringify(result) }], "insurance-display-wrapper");
          });
        })

        DOM.elid('claim-insurance').addEventListener('click', () => {
          let airlineAddress = DOM.elid('insurance-airline').value;
          let flight = DOM.elid('insurance-flight').value;

          contract.withdrawInsurancePayout((error, result) => {
              console.log('Pay passenger insurance money: ' + JSON.stringify(error) + ', result: ' + JSON.stringify(result));
              displaySimple([{ label: 'Pay passenger insurance money', error: getErrorMessage(error), value: JSON.stringify(result) }], "insurance-display-wrapper");
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
