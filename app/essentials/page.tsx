// app/essentials/page.tsx
import type { Metadata } from "next";
import EssentialsClient from "./EssentialsClient";

export const metadata: Metadata = {
  title: "Qur’an Essentials — Key Ayat for Daily Life",
  description:
    "Curated Qur’anic ayat to help you build habits, boost your iman, and share concise gems with others.",
};

export default function EssentialsPage() {
  return <EssentialsClient />;
}
