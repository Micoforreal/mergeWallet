/**
 * v0 by Vercel.
 * @see https://v0.dev/t/vNFNac6Wshl
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { connectWallet } from "@/helpers/connectWallet";
import { useState } from "react";
// import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast"

export default function HomePage() {
    const [account, setAccount] = useState ('');

    const handleConnectWallet = async () => {
        await connectWallet(setAccount);
      };
    
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="Wallet Icon" />
                <AvatarFallback>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    W
                    <DropdownMenuContent>
                      <DropdownMenuItem>Option 1</DropdownMenuItem>
                      <DropdownMenuItem>Option 2</DropdownMenuItem>
                      <DropdownMenuItem>Option 3</DropdownMenuItem>
                    </DropdownMenuContent>
                  </Button>
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
          </DropdownMenu>
          <span className="font-semibold">Wallet #1</span>
          <span className="text-muted-foreground">0x86b31...1716</span>
        </div>
        <Badge variant="secondary">testnet</Badge>
      </div>
      <div className="text-center mb-4">
        <div className="text-3xl font-bold">$1.287</div>
        <div className="text-muted-foreground">
          0x86b31...1716{" "}
          <Button
            variant="ghost"
            size="icon"
            className="inline-block w-4 h-4 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
          >
            <CopyIcon className="w-4 h-4" />
            <span className="sr-only">Copy address</span>
          </Button>
        </div>
      </div>
      <div className="flex justify-center space-x-2 mb-4">
        <Button variant="outline">Faucet</Button>
        <Button variant="outline">Receive</Button>
        <Button variant="outline">Send</Button>
      </div>
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* user wallets */}

            {/* <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="SUI Icon" />
              <AvatarFallback>SUI</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                SUI <CheckIcon className="inline-block w-4 h-4 text-blue-500" />
              </div>
              <div className="text-muted-foreground">1.338 SUI</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">$1.287</div>
            <Badge variant="destructive">-4.63%</Badge> */}


            <Button onClick={handleConnectWallet}>connect wallet</Button>

          </div>


        </div>
      </div>
      <div>
        <div>
          <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:p-6 w-full sm:w-auto max-w-sm overflow-hidden" />
          <div>
            {/* <XIcon className="h-4 w-4" /> */}
            {/* <span className="sr-only">Close</span> */}
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}


function CopyIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}