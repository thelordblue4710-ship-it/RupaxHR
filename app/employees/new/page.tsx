import { requireProfile } from "@/lib/current-user";
import Shell from "@/components/Shell";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createEmployee } from "../actions";

export default async function NewEmployee() {
  const profile = await requireProfile();
  if (profile.role !== "manager") redirect("/dashboard");

  return (
    <Shell profile={profile} active="employees">
      <Link href="/employees" className="text-sm text-ink/60 hover:text-ink">← All employees</Link>
      <h1 className="mt-2 text-2xl font-semibold">Add employee</h1>
      <p className="mt-1 text-ink/60 text-sm">
        Creates their login and record. They sign in with the email and password you set here.
      </p>

      <form action={createEmployee} className="card mt-6 p-6 grid gap-4 sm:grid-cols-2 max-w-2xl">
        <div className="sm:col-span-2">
          <label className="label">Full name</label>
          <input name="full_name" className="field" required />
        </div>
        <div>
          <label className="label">Work email</label>
          <input name="email" type="email" className="field" required />
        </div>
        <div>
          <label className="label">Temporary password</label>
          <input name="password" type="text" className="field" minLength={8} required />
        </div>
        <div>
          <label className="label">Role</label>
          <select name="role" className="field" defaultValue="employee">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <div>
          <label className="label">Job title</label>
          <input name="job_title" className="field" />
        </div>
        <div>
          <label className="label">Department</label>
          <input name="department" className="field" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input name="phone" className="field" />
        </div>
        <div>
          <label className="label">Start date</label>
          <input name="start_date" type="date" className="field" />
        </div>
        <div className="sm:col-span-2 flex gap-3 pt-2">
          <button className="btn-primary" type="submit">Create employee</button>
          <Link href="/employees" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </Shell>
  );
}
