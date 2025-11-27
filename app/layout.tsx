// app/layout.tsx
import "./globals.css";
import AuthHeaderShell from "@/components/AuthHeaderShell";

export const metadata = {
  title: "Qur’an Memoriser",
  description:
    "Memorise surahs, test your recall, and track progress with a clean, focused interface.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full text-gray-900 antialiased bg-gray-50">
        <AuthHeaderShell />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
