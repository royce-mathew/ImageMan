import "./globals.css";
import { Inter } from "next/font/google";
import { ModeToggle } from "@/lib/custom/mode-toggle";
import { ThemeProvider } from "@/lib/custom/theme-provider";
import Topbar from "@/lib/custom/topbar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@radix-ui/react-tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Image Man",
  description: "A Non-destructive Image Editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <TooltipProvider>
            <Topbar />
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
        </body>
    </html>
  );
}
