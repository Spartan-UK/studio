'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LogIn, UserPlus, HardHat, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timer); // Cleanup on component unmount
    };
  }, []);

  const dayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const dayString = currentDateTime?.toLocaleDateString('en-US', dayOptions);
  const dateString = currentDateTime?.toLocaleDateString('en-US', dateOptions);
  const timeString = currentDateTime?.toLocaleTimeString('en-GB', timeOptions);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <Card className="w-full max-w-4xl shadow-2xl bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="p-4">
            <div className="pt-2 text-foreground">
              {currentDateTime ? (
                <>
                  <p className="text-3xl font-bold">{dayString}, {dateString}</p>
                  <p className="text-8xl font-bold text-primary pt-2 [text-shadow:1px_1px_2px_hsl(var(--accent))]">{timeString}</p>
                </>
              ) : (
                <>
                  <div className="h-[36px] w-3/4 mx-auto bg-gray-400/50 rounded-md animate-pulse" />
                  <div className="h-[96px] mt-2 w-1/2 mx-auto bg-gray-400/50 rounded-md animate-pulse" />
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/check-in/visitor">
                <Card className="bg-white/10 hover:bg-white/30 transition-all duration-300 h-full">
                  <CardHeader className="p-8">
                    <div className="flex justify-center mb-4">
                      <UserPlus className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-3xl">Visitor</CardTitle>
                    <CardDescription className="text-base">
                      For guests, clients, and other visitors.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <Button className="w-full h-14 text-xl transition-transform duration-300 hover:scale-105">
                      Check-In Here
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/check-in/contractor">
                <Card className="bg-white/10 hover:bg-white/30 transition-all duration-300 h-full">
                  <CardHeader className="p-8">
                    <div className="flex justify-center mb-4">
                      <HardHat className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-3xl">Contractor</CardTitle>
                    <CardDescription className="text-base">
                      For maintenance and service personnel.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <Button className="w-full h-14 text-xl transition-transform duration-300 hover:scale-105">
                      Check-In Here
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
            <div className="flex justify-center">
              <Button
                asChild
                variant="destructive"
                className="mt-8 w-1/2 h-16 text-lg hover:scale-[1.02] transform transition-all duration-300"
              >
                <Link href="/check-out">
                  <LogOut className="mr-3 h-6 w-6" />
                  Check Out
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full text-center p-6 text-sm text-muted-foreground flex justify-center items-center">
        <span>Built and maintained by Spartan IT</span>
      </footer>
    </div>
  );
}
