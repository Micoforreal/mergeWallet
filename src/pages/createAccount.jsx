import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const CreateAccount = () => {
    return ( 
    <>
    <div className="flex max-w-md mx-auto h-screen flex-col items-center  ">
        <h1 className="text-2xl font-bold text-center mt-10">Merge Wallet</h1>
        <img src="/logoDark.png" className="my-10"/>
        <h4 className="text-2xl  text-center mt-5">Trusted username based multichain wallet</h4>
        <div className="w-full mt-auto mb-3 flex  flex-col gap-3">
             <Button  className={'text-lg w-full h-12 rounded-4xl'}>Create Wallet</Button>

            <Button variant={'outline'} className={'text-lg border-2 w-full h-12 rounded-4xl'}>Import Existing Wallet</Button>
        </div>
    </div>

    </>  );
}
 
export default CreateAccount;