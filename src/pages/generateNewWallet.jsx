import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Check, Copy, Home, LockKeyhole, UserPenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Link, useNavigate } from "react-router-dom";
import * as bip39 from "bip39";
import { HDKey } from "@scure/bip32";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from 'buffer';

const generatekeypair = async (phrase) => {
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

  try {
    // {"bitcoin wallet"}
    const btcPath = "m/44'/0'/0'/0/0";
    const btcNode = root.derive(btcPath);
    const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(btcNode.publicKey) });
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
        balance: "00",
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
  } catch (error) {
    console.error("Error generating Bitcoin address:", error);
    
    // Still save Ethereum and Solana data if Bitcoin fails
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
        balance: "00",
        logo: "/solana-sol-logo.png",
        privateKey: solNode.privateKey,
      },
    ];

    console.log("Generated Wallet Data (without Bitcoin):", data);
    localStorage.setItem("walletData", JSON.stringify(data));
  }
};

const SavePhrase = ({ mnemonic }) => {
  const [verificationStatus, setVerificationStatus] = useState("not-copied");
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setVerificationStatus("copied");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-semibold mb-2">Save Your Phrase</h2>
      <p className="text-center">
        Make sure to save your phrase in a secure place.
      </p>
      <div className="mt-4 p-4 border rounded-md">
        {/* <p className="text-sm font-medium text-gray-700 mb-2">Your Phrase:</p> */}
        <div className=" p-2 rounded-md flex flex-wrap gap-x-8 gap-y-6  justify-center">
          {mnemonic &&
            mnemonic.split(" ").map((word, index) => (
              <div
                key={index}
                className="text-sm border p-2 w-20 text-center rounded-md font-medium text-gray-900"
              >
                {word}
              </div>
            ))}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Phrase"}
        </Button>
      </div>

      {verificationStatus === "copied" && (
        <p className="mt-4 text-sm text-green-600">
          Great! Make sure to store this phrase somewhere safe before
          continuing.
        </p>
      )}
    </div>
  );
};

const createUsername = (onUsernameOptionChange) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-lg font-semibold mb-2">Create a Username</h2>
    <p>Choose a unique username for your wallet.</p>
    <div className="mt-4 p-4  rounded-md">
      <ToggleGroup
        type="single"
        defaultValue="create"
        onValueChange={(val) => {
          if (onUsernameOptionChange) {
            onUsernameOptionChange(val);
          }
        }}
        className={"flex w-full justify-center items-center"}
      >
        <div className="flex flex-  justify-center items-center gap-x-2">
          <ToggleGroupItem
            value="create"
            className="w-40 h-32 border rounded-md
        "
          >
            <span className="text-sm font-normal ">Create a username</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="buy" className="w-40 border rounded-md h-32">
            <span className="text-sm font-normal ]">Buy a username</span>
          </ToggleGroupItem>
        </div>
      </ToggleGroup>

      <p className="text-xs font-normal text-center  text-gray-500 mt-10">
        Username are NFT's , gas fees a charged when creating a username and it
        can be sold in the marketplace .
      </p>
    </div>
  </div>
);

const FinishStep = ({ navigate, mnemonic }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleFinish = async () => {
    setIsCreating(true);
    await generatekeypair(mnemonic)
    // Simulate wallet creation
    setTimeout(() => {
      setIsCreating(false);
      navigate('/home');
    }, 2000);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-semibold mb-2">Wallet Ready!</h2>
      <p className="text-center mb-6">Your secure wallet has been created successfully.</p>
      
      <div className="w-full space-y-6">
        <div className="p-4 bg-green-50 rounded-md text-center">
          <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-700">
            Your wallet is ready to use. Remember to keep your recovery phrase safe and never share it with anyone.
          </p>
        </div>
        
        <Button 
          className="w-full"
          onClick={handleFinish}
          disabled={isCreating}
        >
          {isCreating ? 'Finalizing Setup...' : 'Go to Wallet Dashboard'}
        </Button>
      </div>
    </div>
  );
};

const GenerteNewWallet = () => {
  const [usernameOption, setUsernameOption] = useState("create");
  const [mnemonic, setMnemonic] = useState();

  // Use the username option to log the selection
  useEffect(() => {
    console.log("Username option selected:", usernameOption);
  }, [usernameOption]);

  const navigate = useNavigate();
  const generatePhrase = async () => {
    const phrase = bip39.generateMnemonic();
    setMnemonic(phrase);
  };
  
  useEffect(() => {
    generatePhrase();
  }, []);
  
  const steps = [
    { 
      title: "Backup", 
      description: "Save Recovery Phrase", 
      stepLogo: <LockKeyhole className="w-4 h-4" />,
      item: <SavePhrase mnemonic={mnemonic} />,
    },
    { 
      title: "Profile", 
      description: "Choose Username", 
      stepLogo: <UserPenIcon className="w-4 h-4" />,
      item: createUsername(setUsernameOption),
    },
    { 
      title: "Finish", 
      description: "Complete Setup", 
      stepLogo: <Check className="w-4 h-4"/> ,
      item: <FinishStep navigate={navigate} mnemonic={mnemonic}/>
    }
  ];
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="container max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">Generate Wallet</h1>
      <div className="">
        <Stepper
          steps={steps}
          className={"flex-row"}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        ></Stepper>
      </div>
      <div className="mt-8 p-4 border rounded-md">
        {steps[currentStep].item}
      </div>

      {steps[currentStep].description === "Add your details" && (
        <div className="flex justify-end my-7 ">
          <Link to={"/home"}>
            <Button
              variant="outline"
              className={""}
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              Skip
            </Button>
          </Link>
        </div>
      )}
      <div className="flex justify-between my-7 mb-auto">
        <Button
          className={"w-full rounded-xl"}
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default GenerteNewWallet;
