import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import PFPTest from './artifacts/contracts/pfpTest.sol/PFPTest.json';

// Update with the contract address logged out to the CLI when it was deployed 
const contractAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';

function getContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(contractAddress, PFPTest.abi, provider);
}

async function getSignedContract() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, PFPTest.abi, signer);
}

function App() {
    const [numTokens, setNumTokens] = useState(1);
    const [saleStatus, setSaleStatus] = useState(false);
    useEffect(() => {
        (async () => {
            if (!window.ethereum) return;
            const contract = getContract();
            const data = await contract.saleStatus();
            setSaleStatus(data);
        })();
    }, []);

    // request access to the user's MetaMask account
    
      async function startSale() {
        if (typeof window.ethereum !== 'undefined') {
          const contract = await getSignedContract();
          const transaction = await contract.startSale(Math.floor((Date.now() + (86400000 * 9)) / 1000));
          await transaction.wait();
          setSaleStatus(true);
        }    
      }

      async function pauseSale() {
        if (typeof window.ethereum !== 'undefined') {
          const contract = await getSignedContract();
          const transaction = await contract.pauseSale();
          await transaction.wait();
          setSaleStatus(false);
        }    
      }

    async function mintToken() {
        if (!numTokens) return;
        if (typeof window.ethereum !== 'undefined') {
            const contract = await getSignedContract();
            const overrides = {
                value: ethers.utils.parseEther(`${0.08 * numTokens}`),
            };
            const transaction = await contract.mintToken(numTokens, overrides);
            await transaction.wait();
        }
    }

  return (
    <div className="App">
      <header className="App-header">
          {saleStatus ? (
              <>
              <input
                onChange={e => setNumTokens(parseInt(e.target.value, 10))}
                type="number"
                min="1"
                max="20"
                value={numTokens}
            />
            <button onClick={mintToken}>Mint Token(s)</button>
              <button onClick={pauseSale}>Pause Sale</button>
              </>
          
          ) : (<button onClick={startSale}>Start Sale</button>)}
        
      </header>
    </div>
  );
}

export default App;