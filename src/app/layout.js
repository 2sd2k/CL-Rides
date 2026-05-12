import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/store";
import { Toast } from "@/components/Toast";
import { Tweaks } from "@/components/Tweaks";
import { ModalOutlet } from "@/components/modals";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "CL Rides",
  description: "Ride coordination for community events.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <StoreProvider>
          {children}
          <ModalOutlet />
          <Toast />
          <Tweaks />
        </StoreProvider>
      </body>
    </html>
  );
}
