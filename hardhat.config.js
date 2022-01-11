/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
const { ROPSTEN_API_URL, ROPSTEN_PRIVATE_KEY } = process.env;
module.exports = {
   solidity: {
      version: "0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    },
   // defaultNetwork: "ropsten",
   paths: {
      artifacts: './src/artifacts',
   },
   networks: {
      hardhat: {
         chainId: 1337,
      },
      ropsten: {
         url: ROPSTEN_API_URL,
         accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
      }
   },
}