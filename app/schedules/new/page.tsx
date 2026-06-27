import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/Shell";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createShift } from "../actions";

export default async function NewShift() {
  const profile = await requireProfile();
  if (profile.role !== "manager") redirect("/dashboard");

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("status", "active")
    .order("full_name");

  return (
    <Shell profile={profile} active="schedules">
      <Link href="/schedules" className="text-sm text-ink/60 hover:text-ink">← All schedules</Link>
      <h1 className="mt-2 text-2xl font-semibold">New shift</h1>
      <p className="mt-1 text-ink/60 text-sm">
        Tick “Send now” to publish it to the employee immediately, or leave it as a draft.
      </p>

      <form action={createShift} className="card mt-6 p-6 grid gap-4 sm:grid-cols-2 max-w-2xl">
        <div className="sm:col-span-2">
          <label className="label">Employee</label>
          <select name="employee_id" className="field" required>
            <option value="">Select an employee…</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input name="work_date" type="date" className="field" required />
        </div>
        <div>
          <label className="label">Location</label>
          <input name="location" className="field" placeholder="e.g. Main store" />
        </div>
        <div>
          <label className="label">Start time</label>
          <input name="start_time" type="time" className="field" required />
        </div>
        <div>
          <label className="label">End time</label>
          <input name="end_time" type="time" className="field" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" className="field" rows={3} />
        </div>
        <label className="sm:col-span-2 flex items-center gap-2 text-sm">
          <input name="publish" type="checkbox" defaultChecked className="h-4 w-4" />
          Send now (publish to employee)
        </label>
        <div className="sm:col-span-2 flex gap-3 pt-2">
          <button className="btn-primary" type="submit">Save shift</button>
          <Link href="/schedules" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </Shell>
  );
}
