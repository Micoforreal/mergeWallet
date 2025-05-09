import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"



const AlertToGetUsername = () => {
    const [open, setOpen] = useState(false);
    return ( 
        <AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger><Button>open</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Sign up with wallet username
      </AlertDialogTitle>
      <AlertDialogDescription>
        To continue, please create a username for your wallet. This will be used to identify your wallet in the system.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <ToggleGroup type="single" defaultValue="left" className={'flex w-full justify-center items-center'}>
    <div className="flex flex-  justify-center items-center gap-x-2">
        <ToggleGroupItem value="left" className="w-40 h-32 border rounded-md
        " >
              <span className="text-sm font-normal ">Create a username</span>
   
        </ToggleGroupItem>
        <ToggleGroupItem value="right" className="w-40 border rounded-md h-32">
                   <span className="text-sm font-normal ]">Buy a username</span>
        </ToggleGroupItem>
    </div>
    </ToggleGroup>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

     );
}
 
export default AlertToGetUsername;