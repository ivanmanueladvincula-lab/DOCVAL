import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import SessionProvider from "../helper/SessionProvider";
import { ErrorProvider } from "../helper/ErrorContext";
import { LoadingProvider } from "../helper/LoadingContext";
import GlobalAlert from "../components/GlobalAlert";
import LoadingScreen from "../components/LoadingScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DocVal",
  description: "Document Evaluation Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <ErrorProvider>
            <SessionProvider>
              {children}
              <GlobalAlert />
              <LoadingScreen />
            </SessionProvider>
          </ErrorProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
