'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./animations.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from '../context/AuthContext';
import { PincodeProvider, usePincode } from '../context/PincodeContext';
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

// Metadata needs to be in a separate variable since we're using 'use client'
const metadata = {
  title: "Buzzat - Your Local Marketplace",
  description: "Shop from local vendors in your area with fast delivery",
};

// Layout content component that uses the context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { pincode, isServiceable, deliveryMessage, updatePincode } = usePincode();
  

  return (
    <>
      <Header 
        pincode={pincode}
        isServiceable={isServiceable}
        deliveryMessage={deliveryMessage}
        onPincodeChange={updatePincode}
      />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <PincodeProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </PincodeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
