import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/Shell";
import Link from "next/link";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const isManager = profile.role === "manager";

  const today = new Date().toISOString().slice(0, 10);

  // Manager sees headline counts; employee sees their upcoming shifts.
  let employeeCount = 0;
  if (isManager) {
    const { count } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true });
    employeeCount = count ?? 0;
  }

  const { data: upcoming } = await supabase
    .from("schedules")
    .select("id, work_date, start_time, end_time, location")
    .gte("work_date", today)
    .order("work_date")
    .limit(5);

  return (
    <Shell profile={profile} active="dashboard">
      <h1 className="text-2xl font-semibold">Welcome, {profile.full_name.split(" ")[0]}</h1>
      <p className="mt-1 text-ink/60">
        {isManager ? "Manager view" : "Your shifts and details"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {isManager && (
          <Link href="/employees" className="card p-5 hover:border-primary transition-colors">
            <div className="text-3xl font-semibold">{employeeCount}</div>
            <div className="mt-1 text-sm text-ink/60">Employee records</div>
          </Link>
        )}
        <Link href="/schedules" className="card p-5 hover:border-primary transition-colors">
          <div className="text-3xl font-semibold">{upcoming?.length ?? 0}</div>
          <div className="mt-1 text-sm text-ink/60">
            {isManager ? "Upcoming published shifts" : "Your upcoming shifts"}
          </div>
        </Link>
      </div>

      <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
        Next up
      </h2>
      <div className="card divide-y divide-line">
        {(upcoming ?? []).length === 0 && (
          <div className="p-5 text-sm text-ink/60">No upcoming shifts yet.</div>
        )}
        {(upcoming ?? []).map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between text-sm">
            <span className="font-medium">{s.work_date}</span>
            <span className="text-ink/70">
              {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
            </span>
            <span className="text-ink/50">{s.location ?? "—"}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
