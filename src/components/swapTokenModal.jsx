import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

const SwapTokenModal = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="text-sm font-normal text-gray-700 border-gray-200 hover:bg-gray-50"
            //   onClick={handleSwap}
          >
            Swap
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader >
            <DialogTitle className={'flex'}>Swap Tokens</DialogTitle>
            <DialogDescription className={'flex'}>
              Exchange SOL for other tokens.
            </DialogDescription>
          </DialogHeader>

          <div className="">
            {/* <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"> */}
            {/* <h2 className="text-xl font-bold mb-4 text-gray-900">Swap Tokens</h2> */}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                  placeholder="0.00"
                  min="0"
                  step="0.001"
                />
                <select className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-900">
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center my-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M7 10v12" />
                <path d="M17 2v12" />
                <path d="M17 14H7" />
                <path d="m7 2 4 4-4 4" />
                <path d="m17 22-4-4 4-4" />
              </svg>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <select className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-900">
                  <option value="USDC">USDC</option>
                  <option value="BONK">BONK</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {/* <Button
                variant="outline"
                // onClick={closeAllModals}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                // disabled={isSubmitting}
              >
                Cancel
              </Button> */}
              <Button
                // onClick={executeSwapTransaction}
                // disabled={isSubmitting || !swapFromAmount || !swapToAmount}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {/* {isSubmitting ? 'Swapping...' : 'Swap'} */}
                swap
              </Button>
            </div>
          </div>
          {/* </div> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SwapTokenModal;
