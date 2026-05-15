import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-black text-white min-h-screen">

          {/* NAVBAR */}
          <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">

            <Link href="/dashboard" className="font-semibold text-lg">
              Revenue OS
            </Link>

            <nav className="flex items-center gap-6 text-sm text-white/70">

              <Link href="/dashboard">Dashboard</Link>
              <Link href="/leads">Leads</Link>
              <Link href="/pipeline">Pipeline</Link>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

            </nav>
          </header>

          {/* AUTH GATE */}
          <SignedOut>
            <div className="flex items-center justify-center min-h-[80vh]">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-semibold">
                  Access Restricted
                </h1>
                <p className="text-white/60">
                  Please sign in to access your Revenue OS dashboard.
                </p>
                <Link
                  href="/sign-in"
                  className="inline-block px-4 py-2 bg-white text-black rounded"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <main className="p-6">{children}</main>
          </SignedIn>

        </body>
      </html>
    </ClerkProvider>
  );
}