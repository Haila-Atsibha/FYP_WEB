import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { LanguageProvider } from "../src/context/LanguageContext";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";
import ToastContainer from "../src/components/ToastContainer";
import ThreeBackground from "../src/components/ThreeBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QuickServe - Fast, Premium Service",
  description: "High-end fast food ordering and service platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <ThreeBackground />
              <Navbar />
              <main className="min-h-screen relative z-0">{children}</main>
              <Footer />
              <ToastContainer />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
