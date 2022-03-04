
const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = "mule cushion need topic rebel tackle copper oppose deputy expand grab alpha";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
        //return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      },
      network_id: '*',
      gas: 5000000
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};
