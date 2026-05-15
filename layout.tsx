import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId } = auth();

  return (
    <div className="min-h-screen flex bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 p-4 space-y-6">

        {/* BRAND */}
        <div className="text-lg font-semibold">
          Revenue AI OS
        </div>

        {/* NAV */}
        <nav className="space-y-2 text-sm">

          <NavItem href="/" label="Dashboard" />
          <NavItem href="/leads" label="Leads" />
          <NavItem href="/pipeline" label="Pipeline" />
          <NavItem href="/ai" label="AI Control" />
          <NavItem href="/analytics" label="Analytics" />
          <NavItem href="/billing" label="Billing" />
          <NavItem href="/team" label="Team" />
          <NavItem href="/settings" label="Settings" />

        </nav>

        {/* ORG INFO */}
        <div className="pt-6 border-t border-white/10 text-xs text-white/60">
          <div>Organization</div>
          <div className="text-white/80 mt-1">
            {orgId || "No org selected"}
          </div>
        </div>

      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-6">

          <div className="text-sm text-white/60">
            Autonomous Revenue System
          </div>

          <div className="flex items-center gap-4">

            <div className="text-xs text-white/50">
              Live AI Agents Running
            </div>

            <UserButton afterSignOutUrl="/" />

          </div>

        </header>

        {/* CONTENT */}
        <main className="p-6 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}

/* ===============================
   NAV ITEM
=============================== */
function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded hover:bg-white hover:text-black transition"
    >
      {label}
    </Link>
  );
}