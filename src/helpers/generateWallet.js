import * as bip32 from "bip32";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import { HDKey } from "@scure/bip32";


export const generatekeypair = async (phrase) => {
  // 12-word phrase
const seed = await bip39.mnemonicToSeed(phrase); // returns Uint8Array
  const root = HDKey.fromMasterSeed(seed);


  // {"ethereum wallet"}
  const ethPath = "m/44'/60'/0'/0/0";
  const ethNode = root.derive(ethPath);
  const ethWallet = new ethers.Wallet(Buffer.from(ethNode.privateKey).toString('hex'));

  console.log("Ethereum Address:", ethWallet.address);

  // {"solana wallet"}
  const solPath = "m/44'/501'/0'/0'";
  const solNode = root.derive(solPath);
  const solKeypair = Keypair.fromSeed(solNode.privateKey.slice(0, 32));

  console.log("Solana Public Key:", solKeypair.publicKey.toBase58());

  // {"bitcoin wallet"}
  const btcPath = "m/44'/0'/0'/0/0";
  const btcNode = root.derive(btcPath);
  const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(btcNode.publicKey), });
const btcPrivateKeyHex = Buffer.from(btcNode.privateKey).toString('hex');

  console.log("Bitcoin Address:", address);

  const data = [
    {
      chain: "ethereum",
      symbol: "ETH",
      address: ethWallet.address,
        balance: "00",
        logo: '/ethereum-eth-logo.png',

      privateKey: ethNode.privateKey,
    },
    {
      chain: "solana",
      symbol: "SOL",
      address: solKeypair.publicKey.toBase58(),
       balance: "1050",
        logo: "/solana-sol-logo.png",
   
     privateKey: solNode.privateKey,
    },
    {
      chain: "bitcoin",
      symbol: "BTC",
      address: address,
      balance:"00",
      logo :"/bitcoin-btc-logo.png",
      privateKey: btcPrivateKeyHex,
    },
  ];

  console.log("Generated Wallet Data:", data);

  localStorage.setItem("walletData", JSON.stringify(data));
};
