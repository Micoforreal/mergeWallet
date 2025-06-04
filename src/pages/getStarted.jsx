import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { Link } from "react-router-dom";

const CreateAccount = () => {
    return ( 
        <>
    <div className="flex max-w-md mx-auto min-h-screen flex-col items-center  ">
        <h1 className="text-3xl font-bold text-center mt-10">Merge Wallet</h1>
        <img src="/logoDark.png" className="my-10"/>
        <h4 className="text-2xl  text-center mt-5">Trusted username based multichain wallet</h4>
        <div className="w-full mt-auto mb-3 flex  flex-col gap-3">
            <Link to={'/generate-new-wallet'}>
             <Button  className={'text-lg w-full h-12 rounded-4xl'}>Create Wallet</Button>
            </Link>

            <Link to={'/import-wallet'}>
            <Button variant={'outline'} 
            onClick={() => {
            }}
            className={'text-lg border-2 w-full h-12 rounded-4xl'}>Import Existing Wallet</Button>
            {/* {RenderCreateAccount()} */}
            </Link>
        </div>
    </div>

    </>  );
}


const RenderCreateAccount = () => {
    const [currentStep, setCurrentStep] = useState(0)
    
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">Stepper Demo</h1>
      <Stepper steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />
      <div className="mt-8 p-4 border rounded-md">
        <h2 className="text-lg font-semibold mb-2">Current Step Content</h2>
        <p>{steps[currentStep].description}</p>
      </div>
    </div>
    )
}


export default CreateAccount;