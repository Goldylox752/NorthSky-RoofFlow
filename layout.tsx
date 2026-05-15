import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getUserPlan } from "@/lib/billing";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId } = auth();
  const plan = orgId ? await getUserPlan(orgId) : "free";

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-black text-white min-h-screen">

          {/* TOP BAR */}
          <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">

            {/* BRAND */}
            <Link href="/dashboard" className="font-semibold text-lg">
              Revenue OS
            </Link>

            {/* NAV */}
            <nav className="flex items-center gap-6 text-sm text-white/70">

              <Link href="/dashboard">Dashboard</Link>
              <Link href="/leads">Leads</Link>
              <Link href="/pipeline">Pipeline</Link>

              {/* PLAN BADGE */}
              <span className="text-xs px-2 py-1 border border-white/20 rounded">
                {plan.toUpperCase()}
              </span>

              {/* UPGRADE BUTTON */}
              {plan === "free" && (
                <button
                  onClick={async () => {
                    const res = await fetch("/api/stripe/checkout", {
                      method: "POST",
                    });

                    const data = await res.json();
                    window.location.href = data.url;
                  }}
                  className="px-3 py-1 bg-white text-black rounded text-xs"
                >
                  Upgrade
                </button>
              )}

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

            </nav>
          </header>

          {/* AUTH */}
          <SignedOut>
            <div className="flex items-center justify-center min-h-[80vh]">
              <div className="text-center space-y-3">
                <h1 className="text-xl font-semibold">
                  Access Required
                </h1>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 bg-white text-black rounded inline-block"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </SignedOut>

          {/* APP */}
          <SignedIn>
            <div className="flex">

              {/* SIDEBAR */}
              <aside className="hidden md:block w-64 border-r border-white/10 min-h-[calc(100vh-60px)] p-4">
                <div className="space-y-3 text-sm text-white/70">

                  <Link href="/dashboard">Overview</Link>
                  <Link href="/leads">Leads CRM</Link>
                  <Link href="/pipeline">Pipeline</Link>
                  <Link href="/analytics">Analytics</Link>
                  <Link href="/settings">Settings</Link>

                </div>
              </aside>

              {/* CONTENT */}
              <main className="flex-1 p-6">
                {children}
              </main>

            </div>
          </SignedIn>

        </body>
      </html>
    </ClerkProvider>
  );
}