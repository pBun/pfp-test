require('dotenv').config();
const ROPSTEN_API_URL = process.env.ROPSTEN_API_URL;
const ROPSTEN_PUBLIC_KEY = process.env.ROPSTEN_PUBLIC_KEY;
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;

const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(ROPSTEN_API_URL);

const contract = require('../src/artifacts/contracts/pfpTest.sol/pfpTest.json');
const contractAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

async function mint(numberOfTokens) {
    const nonce = await web3.eth.getTransactionCount(ROPSTEN_PUBLIC_KEY, 'latest'); //get latest nonce

    //the transaction
    const tx = {
        from: ROPSTEN_PUBLIC_KEY,
        to: contractAddress,
        nonce: nonce,
        gas: 500000,
        data: nftContract.methods.mintNFT(numberOfTokens).encodeABI(),
    };

    const signPromise = web3.eth.accounts.signTransaction(tx, ROPSTEN_PRIVATE_KEY);
    signPromise.then((signedTx) => {
        web3.eth.sendSignedTransaction(
            signedTx.rawTransaction,
            function (err, hash) {
                if (!err) {
                    console.log(
                        'The hash of your transaction is: ',
                        hash,
                        '\nCheck Alchemy\'s Mempool to view the status of your transaction!'
                    );
                } else {
                    console.log(
                        'Something went wrong when submitting your transaction:',
                        err
                    );
                }
            }
        );
    }).catch((err) => {
      console.log(' Promise failed:', err);
    });
}

mint(1);