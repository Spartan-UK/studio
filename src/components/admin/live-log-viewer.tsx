
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logEmitter, type LogPayload } from "@/lib/log-emitter";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

type LogEntry = LogPayload & {
    timestamp: string;
};

export function LiveLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { toast } = useToast();

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

  const handleCopy = () => {
    const logText = logs
      .slice() // Create a copy to avoid reversing the state directly
      .reverse() // Reverse to get chronological order for copying
      .map(log => {
        let logLine = `[${log.timestamp}] ${log.message}`;
        if (log.data) {
          logLine += `\n${JSON.stringify(log.data, null, 2)}`;
        }
        return logLine;
      })
      .join('\n\n');

    navigator.clipboard.writeText(logText).then(() => {
      toast({
        variant: "success",
        title: "Logs Copied",
        description: "The authentication logs have been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy logs: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy logs to the clipboard.",
      });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Authentication Log</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLogs([])}>Clear Logs</Button>
        </div>
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
