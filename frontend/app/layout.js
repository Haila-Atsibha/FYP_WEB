import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { LanguageProvider } from "../src/context/LanguageContext";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";
import ToastContainer from "../src/components/ToastContainer";
import ThreeBackground from "../src/components/ThreeBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "QuickServe - Fast, Premium Service",
  description: "Marketplace connecting job seekers with trusted service providers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
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
