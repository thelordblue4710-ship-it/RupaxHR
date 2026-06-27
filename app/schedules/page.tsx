import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/Shell";
import Link from "next/link";
import { publishShift } from "./actions";

export default async function SchedulesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const isManager = profile.role === "manager";

  // Managers see all shifts (with employee name); employees see only
  // their own published shifts (enforced by RLS).
  const { data: shifts } = await supabase
    .from("schedules")
    .select("id, work_date, start_time, end_time, location, notes, published, employee:employees!schedules_employee_id_fkey(full_name)")
    .order("work_date", { ascending: true });

  return (
    <Shell profile={profile} active="schedules">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Schedules</h1>
          <p className="mt-1 text-ink/60 text-sm">
            {isManager ? "Create shifts and send them to employees." : "Your published shifts."}
          </p>
        </div>
        {isManager && <Link href="/schedules/new" className="btn-primary">New shift</Link>}
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              {isManager && <th className="px-4 py-3 font-medium">Employee</th>}
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(shifts ?? []).map((s: any) => (
              <tr key={s.id} className="hover:bg-paper/60">
                <td className="px-4 py-3 font-medium">{s.work_date}</td>
                {isManager && (
                  <td className="px-4 py-3">{s.employee?.full_name ?? "—"}</td>
                )}
                <td className="px-4 py-3 text-ink/70">
                  {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-ink/60">{s.location ?? "—"}</td>
                <td className="px-4 py-3">
                  {s.published ? (
                    <span className="text-primary">Sent</span>
                  ) : isManager ? (
                    <form action={publishShift}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="btn-ghost py-1 text-xs">Send</button>
                    </form>
                  ) : (
                    <span className="text-accent">Draft</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(shifts ?? []).length === 0 && (
          <div className="p-5 text-sm text-ink/60">
            {isManager ? "No shifts yet. Create one." : "No shifts have been sent to you yet."}
          </div>
        )}
      </div>
    </Shell>
  );
}
