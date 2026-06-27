import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/Shell";
import { redirect } from "next/navigation";

function weekStart(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function hoursBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 3600000;
}

export default async function TimesheetsPage() {
  const profile = await requireProfile();
  if (profile.role !== "manager") redirect("/dashboard");

  const supabase = await createClient();
  const since = weekStart();

  const { data: entries } = await supabase
    .from("time_entries")
    .select("clock_in, clock_out, employee:employees!time_entries_employee_id_fkey(full_name)")
    .gte("clock_in", since)
    .not("clock_out", "is", null);

  const totals = new Map<string, number>();
  for (const e of (entries ?? []) as any[]) {
    const name = e.employee?.full_name ?? "Unknown";
    totals.set(name, (totals.get(name) ?? 0) + hoursBetween(e.clock_in, e.clock_out));
  }
  const rows = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <Shell profile={profile} active="timesheets">
      <h1 className="text-2xl font-semibold">Timesheets</h1>
      <p className="mt-1 text-ink/60 text-sm">Hours worked this week, per employee.</p>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium text-right">Hours this week</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(([name, hrs]) => (
              <tr key={name} className="hover:bg-paper/60">
                <td className="px-4 py-3 font-medium">{name}</td>
                <td className="px-4 py-3 text-right">{hrs.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-5 text-sm text-ink/60">No clocked hours this week yet.</div>
        )}
      </div>
    </Shell>
  );
}
