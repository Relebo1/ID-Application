import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lesotho Home Affairs – National ID Portal",
  description: "Online National Identity Registration Portal for the Ministry of Home Affairs, Lesotho",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
