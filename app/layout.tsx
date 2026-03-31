import type { Metadata } from "next";
import { Cinzel, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cinzel",
  display: "block",
  preload: true,
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  title: "SkillForge",
  description:
    "Learning gamification and skill progression platform — master your craft through interactive skill trees",
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${ibmPlexSans.variable}`}>
      <body className="bg-void-black text-moonlight font-body antialiased">
        {children}
      </body>
    </html>
  );
}
