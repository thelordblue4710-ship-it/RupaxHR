import Link from "next/link";
import type { Profile } from "@/lib/current-user";

export default function Shell({
  profile,
  active,
  children,
}: {
  profile: Profile;
  active: "dashboard" | "employees" | "schedules" | "clock" | "timesheets";
  children: React.ReactNode;
}) {
  const isManager = profile.role === "manager";
  
  const nav = [
    { key: "dashboard", href: "/dashboard", label: "Dashboard", show: true },
    { key: "clock", href: "/clock", label: "Clock", show: true },
    { key: "employees", href: "/employees", label: "Employees", show: isManager },
    { key: "schedules", href: "/schedules", label: "Schedules", show: true },
    { key: "timesheets", href: "/timesheets", label: "Timesheets", show: isManager },
  ].filter((n) => n.show);
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold tracking-tight">
              <span className="text-accent">●</span> HR
            </span>
            <nav className="flex gap-1">
              {nav.map((n) => (
                <Link
                  key={n.key}
                  href={n.href}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    active === n.key
                      ? "bg-paper text-ink font-medium"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink/60 hidden sm:inline">
              {profile.full_name} · {profile.role}
            </span>
            <form action="/auth/signout" method="post">
              <button className="btn-ghost py-1.5">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
