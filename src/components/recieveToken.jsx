import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { useState } from "react";
import { CopyIcon } from "lucide-react";

const RecieveToken = () => {
  const [savedUsername, setSavedUsername] = useState("mylo");
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="text-sm font-normal text-gray-700 border-gray-200 hover:bg-gray-50"
            //   onClick={handleReceive}
          >
            Receive
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {" "}
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Receive with Username
              </h2>
            </DrawerTitle>
            <DrawerDescription>
              {" "}
              <p className="text-gray-600 mb-4 text-sm">
                Share your username to receive SOL or tokens.
              </p>
            </DrawerDescription>
          </DrawerHeader>
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Your Light Protocol username:
              </p>
              {savedUsername ? (
                <div className="flex items-center justify-between">
                  <div className="bg-black text-white px-3 py-2 rounded-md font-medium">
                    @{savedUsername}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-gray-600"
                    onClick={() => {
                      navigator.clipboard.writeText(`@${savedUsername}`);
                      alert("Username copied to clipboard!");
                    }}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-red-500 text-sm">
                  You need to set a username first to receive payments.
                </div>
              )}

              <p className="mt-4 text-xs text-gray-500">
                Users can send you SOL by entering your username instead of your
                wallet address.
              </p>
            </div>

           
          {/* </div> */}
          {/* </div> */}

          <DrawerFooter>

            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default RecieveToken;
