import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { LanguageProvider } from "../src/context/LanguageContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import Navbar from "../src/components/Navbar";
import { Toaster } from "react-hot-toast";
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
        className={`${inter.variable} ${outfit.variable} antialiased flex flex-col min-h-screen`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <ThreeBackground />
                <Navbar />
                <main className="flex-1 flex flex-col relative z-0">{children}</main>
                <Toaster position="top-center" reverseOrder={false} />
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
