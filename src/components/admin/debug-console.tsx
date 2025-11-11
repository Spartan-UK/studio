
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
  { name: "visitors", id: "visitors" },
  { name: "users", id: "users" },
  { name: "employees", id: "employees" },
  { name: "companies", id: "companies" },
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

  const startTest = (collectionName: string) => {
    if (!firestore || !user) {
      addLog("Firestore not initialized or user not logged in.", "error");
      return;
    }
    setRunningTest(collectionName);
    setCurrentStep("write");
    
    const newTestId = `test_${user.uid}_${Date.now()}`;
    const newTestDocRef = doc(firestore, "debug_tests", newTestId);
    setTestDocRef(newTestDocRef);
    
    addLog(`--- Starting test for '${collectionName}' ---`, "info");
    addLog(`Test document will be: debug_tests/${newTestId}`, "info");
  };

  const executeNextStep = async () => {
    if (!testDocRef || !user || !runningTest) {
      addLog("Test not started or has been terminated.", "error");
      return;
    }

    switch (currentStep) {
      case "write":
        addLog(`[1/3] Attempting to WRITE...`, "info");
        const testData = {
          testFor: runningTest,
          uid: user.uid,
          timestamp: serverTimestamp(),
        };
        try {
          await setDoc(testDocRef, testData);
          addLog("WRITE successful.", "success");
          setCurrentStep("read");
        } catch (error: any) {
          addLog(`WRITE failed: ${error.message}`, "error");
          resetTestState();
        }
        break;

      case "read":
        addLog(`[2/3] Attempting to READ...`, "info");
        try {
          const docSnap = await getDoc(testDocRef);
          if (docSnap.exists()) {
            addLog("READ successful. Document data confirmed.", "success");
            setCurrentStep("delete");
          } else {
            addLog("READ failed: Document does not exist after write.", "error");
            resetTestState();
          }
        } catch (error: any) {
          addLog(`READ failed: ${error.message}`, "error");
          resetTestState();
        }
        break;

      case "delete":
        addLog(`[3/3] Attempting to DELETE...`, "info");
        try {
          await deleteDoc(testDocRef);
          addLog("DELETE successful.", "success");
          addLog(`--- Test for '${runningTest}' finished ---`, "info");
          resetTestState();
        } catch (error: any) {
          addLog(`DELETE failed: ${error.message}`, "error");
          resetTestState();
        }
        break;
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
