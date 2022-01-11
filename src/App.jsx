import './App.css';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import PFPTest from './artifacts/contracts/pfpTest.sol/PFPTest.json';

const CONTRACT_ADDRESS = {
  1: '', // mainnet
  3: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // ropsten
  4: '0xF5f4A9FB11C56E2663d644bD64C690C58c4c9656', // rinkeby
  5: '', // goerli
  42: '', // kavan
  1337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // localhost
};
const TOKEN_PRICE = 10.0001; // in eth

async function getContract(signed) {
  if (!window.ethereum) {
    throw new Error('window.ethereum is not defined');
  }
  if (signed) await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { chainId } = await provider.getNetwork();
  const address = CONTRACT_ADDRESS[chainId];
  if (!address) throw new Error(`Contract not deployed on network ${chainId}.`);
  const signer = signed ? provider.getSigner() : provider;
  return new ethers.Contract(address, PFPTest.abi, signer);
}

const GENERIC_ERROR = {
  code: -1,
  message: 'Unknown error',
};

function App() {
  const [numTokens, setNumTokens] = useState(1);
  const [saleStatus, setSaleStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [success, setSuccess] = useState();
  useEffect(() => {
    (async () => {
      try {
        if (!window.ethereum) return;
        const contract = await getContract();
        const data = await contract.saleStatus();
        setSaleStatus(data);
        setLoading(false);
      } catch (err) {
        setError((err && err.error) || err || GENERIC_ERROR);
        setLoading(false);
      }
    })();
  }, []);

  // request access to the user's MetaMask account

  async function startSale() {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      const contract = await getContract(true);
      const transaction = await contract.startSale(
        Math.floor((Date.now() + 86400000 * 9) / 1000),
      );
      await transaction.wait();
      setSaleStatus(true);
      setSuccess('Sale started!');
      setLoading(false);
    } catch (err) {
      setError((err && err.error) || err || GENERIC_ERROR);
      setLoading(false);
    }
  }

  async function pauseSale() {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      const contract = await getContract(true);
      const transaction = await contract.pauseSale();
      await transaction.wait();
      setSaleStatus(false);
      setSuccess('Sale paused!');
      setLoading(false);
    } catch (err) {
      setError((err && err.error) || err || GENERIC_ERROR);
      setLoading(false);
    }
  }

  async function mintToken() {
    if (!numTokens) return;
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      const contract = await getContract(true);
      const overrides = {
        value: ethers.utils.parseEther(`${TOKEN_PRICE * numTokens}`),
      };
      const transaction = await contract.mintToken(numTokens, overrides);
      await transaction.wait();
      setSuccess('Token(s) minted successfully!');
      setLoading(false);
    } catch (err) {
      setError((err && err.error) || err || GENERIC_ERROR);
      setLoading(false);
    }
  }

  async function withdraw() {
    if (!numTokens) return;
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      const contract = await getContract(true);
      const transaction = await contract.withdraw();
      await transaction.wait();
      setSuccess('Withdraw successful!');
      setLoading(false);
    } catch (err) {
      setError((err && err.error) || err || GENERIC_ERROR);
      setLoading(false);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {loading ? (<h4>Loading...</h4>) : ''}
        {saleStatus ? (
          <>
            <input
              onChange={(e) => setNumTokens(parseInt(e.target.value, 10))}
              type="number"
              min="1"
              max="20"
              required
              value={numTokens}
              disabled={loading}
            />
            <button type="button" disabled={loading} onClick={mintToken}>Mint Token(s)</button>
            <button type="button" disabled={loading} onClick={pauseSale}>Pause Sale</button>
          </>
        ) : (<button type="button" disabled={loading} onClick={startSale}>Start Sale</button>)}
        <button type="button" disabled={loading} onClick={withdraw}>Withdraw</button>
        {error ? (
          <p style={{ fontSize: '12px', color: 'red' }}>
            {`Error${
              error.code ? ` ${error.code}` : ''
            }: ${error.message || error}`}

          </p>
        ) : (
          ''
        )}
        {success ? (
          <p style={{ fontSize: '12px', color: 'green' }}>{success}</p>
        ) : (
          ''
        )}
      </header>
    </div>
  );
}

export default App;
