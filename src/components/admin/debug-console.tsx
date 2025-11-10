
"use client";

import { useState } from "react";
import { useFirebase } from "@/firebase";
import { collection, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, PlayCircle } from "lucide-react";

type LogEntry = {
  timestamp: string;
  message: string;
  status: "info" | "success" | "error";
};

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

  const addLog = (message: string, status: "info" | "success" | "error") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, message, status }, ...prev]);
  };

  const runTest = async (collectionName: string) => {
    if (!firestore || !user) {
      addLog("Firestore not initialized or user not logged in.", "error");
      return;
    }
    setRunningTest(collectionName);
    addLog(`--- Starting test for '${collectionName}' collection ---`, "info");

    const testId = `test_${user.uid}_${Date.now()}`;
    const testDocRef = doc(firestore, "debug_tests", testId);
    const testData = {
      testFor: collectionName,
      uid: user.uid,
      timestamp: serverTimestamp(),
    };

    // 1. Write Test
    addLog(`[1/3] Attempting to WRITE to doc: debug_tests/${testId}`, "info");
    try {
      await setDoc(testDocRef, testData);
      addLog("WRITE successful.", "success");
    } catch (error: any) {
      addLog(`WRITE failed: ${error.message}`, "error");
      setRunningTest(null);
      return; // Stop test if write fails
    }

    // 2. Read Test
    addLog(`[2/3] Attempting to READ back doc: debug_tests/${testId}`, "info");
    try {
      const docSnap = await getDoc(testDocRef);
      if (docSnap.exists()) {
        addLog("READ successful. Document data confirmed.", "success");
      } else {
        addLog("READ failed: Document does not exist after write.", "error");
      }
    } catch (error: any) {
      addLog(`READ failed: ${error.message}`, "error");
    }

    // 3. Delete Test
    addLog(`[3/3] Attempting to DELETE doc: debug_tests/${testId}`, "info");
    try {
      await deleteDoc(testDocRef);
      addLog("DELETE successful.", "success");
    } catch (error: any) {
      addLog(`DELETE failed: ${error.message}`, "error");
    }
    
    addLog(`--- Test for '${collectionName}' finished ---`, "info");
    setRunningTest(null);
  };

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
            onClick={() => runTest(col.id)}
            disabled={!!runningTest}
          >
            {runningTest === col.id ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            Test {col.name}
          </Button>
        ))}
      </div>
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
