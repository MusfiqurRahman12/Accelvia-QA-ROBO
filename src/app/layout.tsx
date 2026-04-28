import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA ROBO — AI-Powered Visual QA & Design Comparison Tool",
  description:
    "Compare website layouts against Figma, XD, or any design reference. Detect pixel-level differences, typography mismatches, and responsive design bugs automatically. AI-powered cosmetic bug detection.",
  keywords: [
    "visual regression testing",
    "design QA",
    "pixel comparison",
    "figma comparison",
    "typography checker",
    "responsive design testing",
    "UI bug detection",
  ],
  openGraph: {
    title: "QA ROBO — AI-Powered Visual QA & Design Comparison Tool",
    description:
      "Compare website layouts against design references. Find pixel-level differences, typography mismatches, and cosmetic bugs automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
