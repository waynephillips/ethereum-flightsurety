
const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraKey = "b043d5e78ced40329c14e8459cde23a3";
 //
 const fs = require('fs');
 const mnemonic = fs.readFileSync(".secret").toString().trim();
module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },
      network_id: '*',
      //gas: 9999999
    },
    rinkeby: {
        provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
          network_id: 4,       // rinkeby's id
          gas: 4500000,        // rinkeby has a lower block limit than mainnet
          gasPrice: 10000000000
      }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};
