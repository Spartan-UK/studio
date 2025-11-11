
"use client";

import { useState } from "react";
import { useFirebase } from "@/firebase";
import { collection, doc, setDoc, getDoc, deleteDoc, serverTimestamp, DocumentReference, DocumentData } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, PlayCircle, SkipForward } from "lucide-react";

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


  const executeNextStep = async () => {
    if (!testDocRef || !user || !runningTest) {
      addLog("Test not started or has been terminated.", "error");
      return;
    }

    // Log the attempt *before* awaiting the Firestore call
    addLog(`[${currentStep === 'write' ? 1 : currentStep === 'read' ? 2 : 3}/3] Attempting to ${currentStep.toUpperCase()} to '${testDocRef.path}'...`, "info");
    
    try {
        switch (currentStep) {
        case "write": {
            const testData = getTestDataForCollection(runningTest);
            await setDoc(testDocRef, testData);
            addLog("WRITE successful.", "success");
            setCurrentStep("read");
            break;
        }
        case "read": {
            const docSnap = await getDoc(testDocRef);
            if (docSnap.exists()) {
            addLog("READ successful. Document data confirmed.", "success");
            setCurrentStep("delete");
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
            resetTestState(); // This will set currentStep to 'idle' and hide the button
            break;
        }
        }
    } catch (error: any) {
        addLog(`${currentStep.toUpperCase()} failed: ${error.message}`, "error");
        if (currentStep !== 'delete') {
             addLog(`Cleanup: Attempting to delete partially created test doc...`, "info");
             await deleteDoc(testDocRef).catch(e => addLog(`Cleanup failed: ${e.message}`, "error"));
             addLog(`Cleanup finished.`, "info");
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
       {runningTest && currentStep !== 'idle' && (
        <div className="flex justify-center">
            <Button onClick={executeNextStep} variant="secondary">
                <SkipForward className="mr-2 h-4 w-4" />
                Execute Next Step: {currentStep.toUpperCase()}
            </Button>
        </div>
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
                  <p className={`flex-1 ${getStatusColor(log.status)}`}>
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
