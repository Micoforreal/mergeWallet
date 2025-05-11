import { Stepper } from "@/components/ui/stepper";
import { LockKeyhole, UserCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

// Generate a more realistic seed phrase
const generateMnemonic = () => {
  const words = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", 
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid", 
    "acoustic", "acquire", "across", "act", "action", "actor", "actual", "adapt"
  ];
  
  // Select 12 random words
  const mnemonic = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    mnemonic.push(words[randomIndex]);
  }
  
  return mnemonic;
};

const seedPhrase = generateMnemonic();

const SavePhraseStep = ({ verificationStatus, setVerificationStatus }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(seedPhrase.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setVerificationStatus('copied');
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-semibold mb-2">Save Your Recovery Phrase</h2>
      <p className="text-center mb-4">This 12-word phrase is the only way to recover your wallet. Keep it somewhere safe and secret.</p>
      
      <div className="mt-4 p-4 border rounded-md w-full">
        <div className="p-2 rounded-md flex flex-wrap gap-2 justify-center">
          {seedPhrase.map((word, index) => (
            <div key={index} className="text-sm border p-2 w-20 text-center rounded-md font-medium text-gray-900">
              {index + 1}. {word}
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
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Phrase"}
        </Button>
      </div>
      
      {verificationStatus === 'copied' && (
        <p className="mt-4 text-sm text-green-600">
          Great! Make sure to store this phrase somewhere safe before continuing.
        </p>
      )}
    </div>
  );
};

const UserDetailsStep = ({ 
  username, 
  setUsername, 
  fullName, 
  setFullName, 
  verificationStatus, 
  setVerificationStatus 
}) => {
  const [isChecking, setIsChecking] = useState(false);
  
  const checkUsername = () => {
    if (!username || username.length < 3) {
      setVerificationStatus('invalid_username');
      return;
    }
    
    // Simulate username availability check
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setVerificationStatus(
        username === 'admin' || username === 'test' 
          ? 'username_taken' 
          : 'details_valid'
      );
    }, 1000);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-semibold mb-2">Choose Your Username</h2>
      <p className="text-center mb-4">This username will identify your wallet in the network.</p>
      
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username (public)</Label>
          <Input
            id="username"
            placeholder="Choose a unique username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setVerificationStatus('pending');
            }}
          />
          
          {verificationStatus === 'invalid_username' && (
            <p className="text-sm text-red-600">Username must be at least 3 characters</p>
          )}
          
          {verificationStatus === 'username_taken' && (
            <p className="text-sm text-red-600">This username is already taken</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name (optional)</Label>
          <Input
            id="fullName"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        
        <Button 
          className="w-full"
          onClick={checkUsername}
          disabled={isChecking}
        >
          {isChecking ? 'Checking...' : 'Verify Username'}
        </Button>
        
        {verificationStatus === 'details_valid' && (
          <p className="mt-4 text-sm text-green-600">
            Username looks good! You're ready to continue.
          </p>
        )}
      </div>
    </div>
  );
};

const FinishStep = ({ navigate }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleFinish = () => {
    setIsCreating(true);
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

const steps = [
  { 
    title: "Backup", 
    description: "Save Recovery Phrase", 
    stepLogo: <LockKeyhole className="w-4 h-4"/> 
  },
  { 
    title: "Profile", 
    description: "Choose Username", 
    stepLogo: <UserCircle className="w-4 h-4"/> 
  },
  { 
    title: "Finish", 
    description: "Complete Setup", 
    stepLogo: <Check className="w-4 h-4"/> 
  }
];

const GenerateNewWallet = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  
  // Form state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Verification status for each step
  const [step1Status, setStep1Status] = useState('pending');
  const [step2Status, setStep2Status] = useState('pending');
  
  // Determine if the next button should be enabled
  const canGoNext = () => {
    if (currentStep === 0) return step1Status === 'copied';
    if (currentStep === 1) return step2Status === 'details_valid';
    return true;
  };
  
  // Handle step changes with validation
  const handleStepChange = (newStep) => {
    // Going backward is always allowed
    if (newStep < currentStep) {
      setCurrentStep(newStep);
      return;
    }
    
    // Going forward requires validation
    if (canGoNext()) {
      setCurrentStep(newStep);
    }
  };
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <SavePhraseStep 
            verificationStatus={step1Status} 
            setVerificationStatus={setStep1Status}
          />
        );
      case 1:
        return (
          <UserDetailsStep
            username={username}
            setUsername={setUsername}
            fullName={fullName}
            setFullName={setFullName}
            verificationStatus={step2Status}
            setVerificationStatus={setStep2Status}
          />
        );
      case 2:
        return <FinishStep navigate={navigate} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Generate Wallet</h1>
      
      <div className="mb-8">
        <Stepper 
          steps={steps} 
          className="flex-row" 
          currentStep={currentStep} 
          onStepChange={handleStepChange}
        />
      </div>
      
      <div className="mt-8 p-4 border rounded-md min-h-[400px]">
        {renderStepContent()}
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => handleStepChange(currentStep - 1)} 
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        {currentStep < 2 ? (
          <Button 
            onClick={() => handleStepChange(currentStep + 1)} 
            disabled={!canGoNext()}
          >
            Next
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default GenerateNewWallet;