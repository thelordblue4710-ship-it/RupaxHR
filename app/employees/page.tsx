import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/Shell";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  const profile = await requireProfile();
  if (profile.role !== "manager") redirect("/dashboard");

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, email, role, department, job_title, status")
    .order("full_name");

  return (
    <Shell profile={profile} active="employees">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employee records</h1>
        <Link href="/employees/new" className="btn-primary">Add employee</Link>
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Department</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(employees ?? []).map((e) => (
              <tr key={e.id} className="hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/employees/${e.id}`} className="font-medium hover:text-primary">
                    {e.full_name}
                  </Link>
                  <div className="text-ink/50">{e.email}</div>
                </td>
                <td className="px-4 py-3 capitalize">{e.role}</td>
                <td className="px-4 py-3 hidden sm:table-cell">{e.department ?? "—"}</td>
                <td className="px-4 py-3 hidden sm:table-cell capitalize">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(employees ?? []).length === 0 && (
          <div className="p-5 text-sm text-ink/60">No employees yet. Add your first one.</div>
        )}
      </div>
    </Shell>
  );
}
