import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "./ui/input";

/**
 * Dialog to prompt the user to create a username
 */
const AlertToGetUsername = ({ 
  open, 
  onOpenChange, 
  onSave, 
  username, 
  setUsername, 
  isSubmitting,
  errorMessage,
  registrationStep
}) => {
  return ( 
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Create Your Wallet Username
          </AlertDialogTitle>
          <AlertDialogDescription>
            To continue, please create a username for your wallet. This will be used to identify your wallet in the system.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full"
            disabled={isSubmitting}
          />
          
          {errorMessage && (
            <div className="mt-2 text-sm text-red-600">
              {errorMessage}
            </div>
          )}
          
          {registrationStep === 'creating-account' && (
            <div className="mt-4 text-sm text-blue-600">
              Creating your account...
            </div>
          )}
          
          {registrationStep === 'minting' && (
            <div className="mt-4 text-sm text-blue-600">
              Registering your username...
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onSave} 
            disabled={isSubmitting || !username.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save Username'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
 
export default AlertToGetUsername;