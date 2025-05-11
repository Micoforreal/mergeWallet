import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Copy, Check } from "lucide-react";

/**
 * Component for backing up and restoring username data
 */
export default function BackupRestoreUsername({ 
  lightService, 
  publicKey, 
  username,
  onBackupComplete,
  onRestoreComplete 
}) {
  const [backupData, setBackupData] = useState("");
  const [restoreData, setRestoreData] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("backup");
  
  // Generate backup data
  const handleGenerateBackup = async () => {
    try {
      setError("");
      setSuccess("");
      if (!publicKey) {
        setError("Please connect your wallet first");
        return;
      }
      
      const data = await lightService.exportUsernameData(publicKey);
      if (!data) {
        setError("No username data found to backup");
        return;
      }
      
      // Convert to JSON string
      const jsonData = JSON.stringify(data, null, 2);
      setBackupData(jsonData);
      
      if (onBackupComplete) {
        onBackupComplete(data);
      }
      
      setSuccess("Backup data generated successfully!");
    } catch (err) {
      console.error("Error generating backup:", err);
      setError("Failed to generate backup: " + (err.message || "Unknown error"));
    }
  };
  
  // Copy backup data to clipboard
  const handleCopyBackup = () => {
    try {
      navigator.clipboard.writeText(backupData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      setError("Failed to copy to clipboard");
    }
  };
  
  // Download backup as a file
  const handleDownloadBackup = () => {
    try {
      const blob = new Blob([backupData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mergewallet-username-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading backup:", err);
      setError("Failed to download backup");
    }
  };
  
  // Restore from backup data
  const handleRestore = async () => {
    try {
      setError("");
      setSuccess("");
      
      if (!publicKey) {
        setError("Please connect your wallet first");
        return;
      }
      
      if (!restoreData) {
        setError("Please enter your backup data");
        return;
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(restoreData);
      } catch (err) {
        setError("Invalid backup data format");
        return;
      }
      
      // Validate backup data
      if (!parsedData.username || !parsedData.mintAddress) {
        setError("Backup data is missing required fields");
        return;
      }
      
      // Restore username
      const success = await lightService.importUsernameData(publicKey, parsedData);
      
      if (success) {
        setSuccess("Username restored successfully!");
        setRestoreData("");
        
        if (onRestoreComplete) {
          onRestoreComplete(parsedData.username);
        }
      } else {
        setError("Failed to restore username");
      }
    } catch (err) {
      console.error("Error restoring username:", err);
      setError("Failed to restore username: " + (err.message || "Unknown error"));
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-gray-200 text-gray-700"
          onClick={() => {
            setError("");
            setSuccess("");
            setIsDialogOpen(true);
          }}
        >
          Backup/Restore Username
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Backup & Restore Username</DialogTitle>
          <DialogDescription>
            Export your username for safekeeping or restore from a previous backup.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="backup" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="restore">Restore</TabsTrigger>
          </TabsList>
          
          <TabsContent value="backup" className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Save your username data so you can restore it on another device or browser.
            </p>
            
            {username ? (
              <>
                <div className="flex flex-col space-y-2">
                  {backupData ? (
                    <>
                      <Label htmlFor="backup-data">Your Backup Data:</Label>
                      <div className="relative">
                        <textarea
                          id="backup-data"
                          className="w-full h-32 p-2 border rounded-md font-mono text-xs"
                          value={backupData}
                          readOnly
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={handleCopyBackup}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2 mt-2">
                        <Button
                          size="sm"
                          className="flex items-center gap-1 text-xs"
                          onClick={handleDownloadBackup}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setBackupData("")}
                        >
                          Reset
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button 
                      onClick={handleGenerateBackup}
                      className="flex items-center gap-1 text-xs"
                    >
                      Generate Backup
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-amber-600 p-4 bg-amber-50 rounded-md">
                You need to set a username first before you can back it up.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="restore" className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Restore your username from a previous backup.
            </p>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="restore-data">Paste Backup Data:</Label>
              <textarea
                id="restore-data"
                className="w-full h-32 p-2 border rounded-md font-mono text-xs"
                value={restoreData}
                onChange={(e) => setRestoreData(e.target.value)}
                placeholder='Paste your backup data here...'
              />
              
              <Button 
                onClick={handleRestore}
                className="flex items-center gap-1 text-xs"
                disabled={!restoreData}
              >
                <Upload className="h-4 w-4" />
                Restore Username
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-600 mt-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-600 mt-4">
            {success}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 