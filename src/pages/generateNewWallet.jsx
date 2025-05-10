import { Stepper } from "@/components/ui/stepper";
import { Home, LockKeyhole } from "lucide-react";
import { useState } from "react";

const fakePrase = ["abandon", "ability", "able", "about", "above" ,"absent ","absorb", "abstract" ,"bsurd", "abuse", "access" ,"accident"];

const savePhrase = ()=>(
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-semibold mb-2">Save Your Phrase</h2>
      <p>Make sure to save your phrase in a secure place.</p>
      <div className="mt-4 p-4 border rounded-md">
        {/* <p className="text-sm font-medium text-gray-700 mb-2">Your Phrase:</p> */}
        <div className=" p-2 rounded-md flex flex-wrap gap-x-10 gap-y-10  justify-center">
          {fakePrase.map((word, index) => (
            <div key={index} className="text-sm border p-2 w-20 text-center rounded-md font-medium text-gray-900">
              {word}
            </div>
          ))}
        </div>
        </div>

    </div>
  )


  
const steps = [
  { title: "Step 1", description: "Secure Account" ,stepLogo:<LockKeyhole className="w-4 h-4"/>, item: savePhrase()},
  { title: "Step 2", description: "Verify your email", stepLogo:<Home className="w-4 h-4"/>, item:"2"},
  { title: "Step 3", description: "Add your details", item:"3"},
  // { title: "Step 4", description: "Confirm and finish" },
]



const GenerteNewWallet = () => {
const [currentStep, setCurrentStep] = useState(0)
    
  return (
    <div className="container max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">Generate Wallet</h1>
      <div className="">

      <Stepper steps={steps} className={'flex-row'} currentStep={currentStep} onStepChange={setCurrentStep} >

      </Stepper>
      </div>
      <div className="mt-8 p-4 border rounded-md">
        <p>
          {steps[currentStep].item}
          </p>
      </div>
    </div>
    )
}
 
export default GenerteNewWallet;