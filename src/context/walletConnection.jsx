import {  createContext, useEffect, useState } from "react";
import { ethers } from 'ethers';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';


const getEthBalance = async (address)=>{
    
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');
const balance = await provider.getBalance(address);
const eth = ethers.formatEther(balance); // in ETH

console.log("ETH Balance:", eth);

}

const getSolanaBalance = async (address) => {
    
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
const publicKey = new PublicKey(address);
const lamports = await connection.getBalance(publicKey);
const sol = lamports / 1e9;

console.log("SOL Balance:", sol);
    
}


const getBtcBalance = async (address) => {
    const btcAddress = address;
const response = await fetch(`https://blockstream.info/api/address/${btcAddress}`);
const data = await response.json();

const btcBalance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
console.log("BTC Balance:", btcBalance / 1e8); // in BTC

    
}

const getBtcBalance = async (address) => {
    const btcAddress = address;
const response = await fetch(`https://blockstream.info/api/address/${btcAddress}`);
const data = await response.json();

const btcBalance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
console.log("BTC Balance:", btcBalance / 1e8); // in BTC

    
}


export const WalletContext = createContext({});



export const WalletContextProvider = ({children})=>{
  
      const [walletData, setWalletData]= useState([])

        useEffect(()=>{
            const storedWalletData = localStorage.getItem("walletData");

            if (storedWalletData) {
                setWalletData(JSON.parse(storedWalletData));
            }


        }, []);




    
    return(
        
        <WalletContext.Provider value={{walletData, setWalletData}}>
    
            {children}
        </WalletContext.Provider>
        
        )

}