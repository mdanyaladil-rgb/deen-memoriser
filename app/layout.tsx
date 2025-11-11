// app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Qur’an Memoriser",
  description: "Memorise surahs, test your recall, and track progress with a clean, focused interface.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // If you have auth, pass the actual email below.
  const userEmail: string | undefined = undefined; // e.g., session?.user?.email

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full text-gray-900 antialiased bg-gray-50">
        <Header userEmail={userEmail} />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
