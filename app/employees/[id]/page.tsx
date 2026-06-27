import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/Shell";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export default async function EmployeeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  if (profile.role !== "manager") redirect("/dashboard");

  const supabase = await createClient();
  const { data: emp } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();
  if (!emp) notFound();

  const { data: shifts } = await supabase
    .from("schedules")
    .select("work_date, start_time, end_time, location, published")
    .eq("employee_id", id)
    .order("work_date", { ascending: false })
    .limit(10);

  const rows: [string, string | null][] = [
    ["Email", emp.email],
    ["Role", emp.role],
    ["Job title", emp.job_title],
    ["Department", emp.department],
    ["Phone", emp.phone],
    ["Start date", emp.start_date],
    ["Status", emp.status],
  ];

  return (
    <Shell profile={profile} active="employees">
      <Link href="/employees" className="text-sm text-ink/60 hover:text-ink">← All employees</Link>
      <h1 className="mt-2 text-2xl font-semibold">{emp.full_name}</h1>

      <div className="card mt-6 divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="px-4 py-3 grid grid-cols-3 text-sm">
            <span className="text-ink/50">{k}</span>
            <span className="col-span-2 capitalize">{v ?? "—"}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
        Recent shifts
      </h2>
      <div className="card divide-y divide-line">
        {(shifts ?? []).length === 0 && (
          <div className="p-4 text-sm text-ink/60">No shifts scheduled.</div>
        )}
        {(shifts ?? []).map((s, i) => (
          <div key={i} className="p-4 flex items-center justify-between text-sm">
            <span className="font-medium">{s.work_date}</span>
            <span className="text-ink/70">{s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}</span>
            <span className="text-ink/50">{s.location ?? "—"}</span>
            <span className={s.published ? "text-primary" : "text-accent"}>
              {s.published ? "Published" : "Draft"}
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
