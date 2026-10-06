import type { Metadata } from "next";
import "./globals.css";
import { WardProvider } from "@/lib/store";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "ICU Handover & Bed Management System",
  description: "Spatial ICU bed dashboard, SBAR handover, ward analytics and print engine.",
  icons: { icon: "/heartbeat.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <WardProvider>{children}</WardProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
