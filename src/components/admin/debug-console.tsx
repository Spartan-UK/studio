
"use client";

import { useState } from "react";
import { useFirebase } from "@/firebase";
import { collection, doc, setDoc, getDoc, deleteDoc, serverTimestamp, DocumentReference, DocumentData } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayCircle, Pencil, FileSearch, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LogEntry = {
  timestamp: string;
  message: string;
  status: "info" | "success" | "error";
};

type TestStep = "idle" | "write" | "read" | "delete" | "finished";

const collectionsToTest = [
  { name: "Visitors", id: "visitors" },
  { name: "Users", id: "users" },
  { name: "Employees", id: "employees" },
  { name: "Companies", id: "companies" },
];

export function DebugConsole() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<TestStep>("idle");
  const [testDocRef, setTestDocRef] = useState<DocumentReference<DocumentData> | null>(null);

  const addLog = (message: string, status: "info" | "success" | "error") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, message, status }, ...prev]);
  };

  const startTest = (collectionId: string) => {
    if (!firestore || !user) {
      addLog("Firestore not initialized or user not logged in.", "error");
      toast({
        variant: "destructive",
        title: "Test Error",
        description: "You must be logged in to run tests.",
      });
      return;
    }
    setLogs([]); // Clear logs on new test
    setRunningTest(collectionId);
    
    const newTestId = `test_${user.uid}_${Date.now()}`;
    const newTestDocRef = doc(firestore, collectionId, newTestId);
    setTestDocRef(newTestDocRef);
    
    addLog(`--- Starting test for '${collectionId}' ---`, "info");
    addLog(`Test document will be: ${collectionId}/${newTestId}`, "info");
    
    // Set the first step to be executed
    setCurrentStep("write");
  };

  const getTestDataForCollection = (collectionId: string) => {
    if (!user) return {};
    const baseData = {
      testRunBy: user.uid,
      testTimestamp: serverTimestamp(),
    };

    switch (collectionId) {
      case "visitors":
        return { 
            ...baseData,
            type: 'visitor', 
            name: 'Debug Test', 
            firstName: 'Debug', 
            surname: 'Test', 
            company: 'Debug Co', 
            email: `debug_${Date.now()}@test.com`,
            phone: '01234567890',
            checkInTime: serverTimestamp(), 
            checkedOut: false 
        };
      case "users":
        return { 
            ...baseData,
            uid: `debug_test_${Date.now()}`,
            displayName: 'Debug Test User', 
            firstName: 'Debug', 
            surname: 'Test', 
            email: `debug_${Date.now()}@test.com`,
            role: 'user'
        };
      case "employees":
        return { 
            ...baseData,
            displayName: 'Debug Test Employee', 
            firstName: 'Debug', 
            surname: 'Test', 
            email: `debug_${Date.now()}@test.com` 
        };
      case "companies":
        return { 
            ...baseData,
            name: 'Debug Test Company' 
        };
      default:
        return baseData;
    }
  };


  const executeStep = async (stepToExecute: "write" | "read" | "delete") => {
    if (!testDocRef || !user || !runningTest) {
      addLog("Test not started or has been terminated.", "error");
      return;
    }

    addLog(`Attempting to ${stepToExecute.toUpperCase()} document at '${testDocRef.path}'...`, "info");
    
    try {
        switch (stepToExecute) {
            case "write": {
                const testData = getTestDataForCollection(runningTest);
                await setDoc(testDocRef, testData);
                addLog("WRITE successful.", "success");
                setCurrentStep("read"); // Move to next step
                break;
            }
            case "read": {
                const docSnap = await getDoc(testDocRef);
                if (docSnap.exists()) {
                    addLog("READ successful. Document data confirmed:", "success");
                    addLog(JSON.stringify(docSnap.data(), null, 2), "success");
                    setCurrentStep("delete"); // Move to next step
                } else {
                    addLog("READ failed: Document does not exist after write.", "error");
                    resetTestState();
                }
                break;
            }
            case "delete": {
                await deleteDoc(testDocRef);
                addLog("DELETE successful.", "success");
                addLog(`--- Test for '${runningTest}' finished ---`, "info");
                resetTestState(); // Test is complete
                break;
            }
        }
    } catch (error: any) {
        addLog(`${stepToExecute.toUpperCase()} failed: ${error.message}`, "error");
        console.error("Firestore operation failed:", error); // Log the actual error
        
        // Attempt cleanup but don't assume it will work
        if (stepToExecute !== 'delete' && testDocRef) {
             addLog(`Cleanup: Attempting to delete partially created test doc...`, "info");
             try {
                await deleteDoc(testDocRef);
                addLog("Cleanup successful.", "info");
             } catch (cleanupError: any) {
                addLog(`Cleanup failed: ${cleanupError.message}`, "error");
                console.error("Cleanup failed:", cleanupError);
             }
        }
        resetTestState();
    }
  };

  const resetTestState = () => {
    setRunningTest(null);
    setCurrentStep("idle");
    setTestDocRef(null);
  }

  const getStatusColor = (status: LogEntry["status"]) => {
    switch (status) {
      case "success": return "text-green-500";
      case "error": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };
  
  const stepHasPassed = (stepName: TestStep) => {
    const steps: TestStep[] = ["write", "read", "delete", "finished"];
    return steps.indexOf(currentStep) > steps.indexOf(stepName);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collectionsToTest.map((col) => (
          <Button
            key={col.id}
            onClick={() => startTest(col.id)}
            disabled={!!runningTest}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Test {col.name}
          </Button>
        ))}
      </div>
       {runningTest && (
        <Card>
            <CardContent className="p-4 flex justify-center items-center gap-2">
                <Button onClick={() => executeStep('write')} disabled={currentStep !== 'write'}>
                    {stepHasPassed('write') ? <Check className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                    Write
                </Button>
                <div className="h-px w-8 bg-border" />
                <Button onClick={() => executeStep('read')} disabled={currentStep !== 'read'}>
                    {stepHasPassed('read') ? <Check className="mr-2 h-4 w-4" /> : <FileSearch className="mr-2 h-4 w-4" />}
                    Read
                </Button>
                <div className="h-px w-8 bg-border" />
                <Button onClick={() => executeStep('delete')} disabled={currentStep !== 'delete'}>
                    {stepHasPassed('delete') ? <Check className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                </Button>
                <Button onClick={resetTestState} variant="ghost" size="icon" className="ml-4">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cancel Test</span>
                </Button>
            </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-72 w-full">
            <div className="p-4 font-mono text-xs">
              {logs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Click a test button to begin.
                </p>
              )}
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="font-semibold text-gray-400">
                    [{log.timestamp}]
                  </span>
                  <p className={`flex-1 whitespace-pre-wrap break-words ${getStatusColor(log.status)}`}>
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
