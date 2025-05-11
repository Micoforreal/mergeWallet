import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

/**
 * Alert component shown when the user's username is stored in fallback storage
 * rather than on-chain. Provides explanation and allows user to retry on-chain storage.
 */
export default function FallbackStorageAlert({ isFallback, username, onRetry, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only show alert if we detect fallback storage is being used
    setIsVisible(isFallback && !!username);
  }, [isFallback, username]);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 animate-fadeIn">
      <div className="flex gap-3">
        <div className="pt-1">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800 mb-1">
            Username Storage Notice
          </h4>
          <p className="text-xs text-amber-700 mb-3">
            Your username <strong>@{username}</strong> is currently only stored locally and not fully registered on the blockchain. 
            This means it may not be accessible from other devices or browsers.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs py-1 h-8"
              onClick={onRetry}
            >
              Retry Blockchain Registration
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs py-1 h-8"
              onClick={() => {
                setIsVisible(false);
                if (onDismiss) onDismiss();
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 