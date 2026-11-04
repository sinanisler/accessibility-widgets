import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { THEME_BOOT_SCRIPT } from "@/components/theme-switch";
import "./globals.css";

export const metadata: Metadata = {
  title: "لوحة تحكم إمكانية الوصول",
  description: "إدارة المواقع والرخص والماسح ومؤشرات الاستخدام",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
