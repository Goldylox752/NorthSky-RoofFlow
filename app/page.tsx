// app/page.tsx
import HomeClient from "@/components/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launch your SaaS faster | Production-ready SaaS starter kit",
  description:
    "Build and launch your SaaS in days, not months. Includes auth, billing, subscriptions, and scaling architecture. Plans start at $9/month.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Launch your SaaS faster",
    description:
      "A production-ready SaaS starter kit with authentication, billing, and scaling built in.",
    type: "website",
    siteName: "SaaS Starter Kit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Launch your SaaS faster",
    description:
      "Production-ready SaaS boilerplate with auth, billing, and scaling built in.",
  },
};

export default function Page() {
  return <HomeClient />;
}