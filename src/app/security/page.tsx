import type { Metadata } from "next";
import SecurityDashboard from "@/components/security/SecurityDashboard";

export const metadata: Metadata = {
  title: "Security Monitor | Viktor Hertfelder",
  description: "A static overview of security advisories relevant to my technology watchlist.",
};

export default function SecurityPage() {
  return <SecurityDashboard />;
}
