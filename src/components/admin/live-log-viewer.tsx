
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logEmitter, type LogPayload } from "@/lib/log-emitter";
import { Button } from "../ui/button";

type LogEntry = LogPayload & {
    timestamp: string;
};

export function LiveLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const handleLog = (payload: LogPayload) => {
      const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
      setLogs((prev) => [{ ...payload, timestamp }, ...prev]);
    };

    logEmitter.on('log', handleLog);

    return () => {
      logEmitter.off('log', handleLog);
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Authentication Log</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setLogs([])}>Clear Logs</Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full rounded-md border bg-muted/50">
          <div className="p-4 font-mono text-xs">
            {logs.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-12">
                Attempt to sign in to see logs...
              </p>
            )}
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2 items-start border-b border-border/50 py-2">
                <span className="font-semibold text-gray-500">
                  [{log.timestamp}]
                </span>
                <div className="flex-1">
                    <p className="whitespace-pre-wrap break-words text-foreground">
                        {log.message}
                    </p>
                    {log.data && (
                        <pre className="mt-1 text-muted-foreground text-[10px] bg-background p-2 rounded-sm">
                            {JSON.stringify(log.data, null, 2)}
                        </pre>
                    )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
