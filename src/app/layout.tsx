import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "LMS SMA Negeri 4 Ternate",
  description: "Portal LMS mata pelajaran kelas X, XI, dan XII",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
