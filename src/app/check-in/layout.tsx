import { SpartanIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <SpartanIcon className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Spartan Check-In</h1>
          </Link>
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
