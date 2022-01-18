import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [msg, setMsg] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress ="0x928dE5D732aFb1472b75D954fB7dE5a9A13B9E71";
  const contractABI= abi.abi;

  useEffect(() => {
    checkIfWalletIsConnected();

    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

   
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
  
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  
   const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log(accounts);
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      checkIfWalletIsConnected();
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getWaves();
        console.log("Retrieved total wave count before waving...", 
        count.toNumber());

        const waveTxn = await wavePortalContract.wave(msg, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getWaves();
        console.log("Retrieved total wave count after waiving...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

 const getAllWaves = async () => {

    try {

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
   
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
  
      <div className="container">
      <div className="row">
      <div className="col-md-3" />
      <div className="col-md-6">
        <div className="header">
        Hey 👋, I'm Rajat.
        </div>

        <div className="bio">
        Wave at me on Ethereum blockchain! Maybe send a sweet message too?<br></br>
        Connect your wallet, write your message and wave at me 👋
        </div>
      
        <textarea type="text" id="input" class="input-box" placeholder="Enter your message here :)" value={msg} onChange={ e => setMsg(e.target.value)}/>

        <button className="waveButton"onClick={wave}>
          Wave at Me
        </button>
       
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
      </div>
      <div className="row">
      <div className="col-md-3" />
      <div className="col-md-6">
       
        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="wave-log">
              <div>
              <span className="wave-log-heading">Waver: </span> 
               <span className="wave-log-data">
              {wave.address}
              </span>
              </div>
              <div>
               <span className="wave-log-heading">Time:  </span>
               <span className="wave-log-data">{wave.timestamp.toString()} </span>
               </div>
              <div> 
              <span className="wave-log-heading">Message: </span>
               <span className="wave-log-data">
              {wave.message}
              </span>
              </div>
            </div>)
        })}
      </div>
    </div> 
    
  </div>
  );
}
