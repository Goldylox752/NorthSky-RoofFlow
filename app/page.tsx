"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();

  const go = (plan: string) => {
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <Hero go={go} />

      <SocialProof />

      <ProblemSolution />

      <Features />

      <Pricing go={go} />

      <FinalCTA go={go} />

      <Footer />
    </main>
  );
}