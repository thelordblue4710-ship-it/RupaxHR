"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Manager creates a new employee: an auth login + a profile row.
export async function createEmployee(formData: FormData) {
  // Verify the caller is a manager (RLS also enforces this, but fail early).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase
    .from("employees").select("role").eq("id", user.id).single();
  if (me?.role !== "manager") throw new Error("Only managers can add employees.");

  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const full_name = String(formData.get("full_name")).trim();
  const role = String(formData.get("role")) === "manager" ? "manager" : "employee";
  const department = String(formData.get("department") || "") || null;
  const job_title = String(formData.get("job_title") || "") || null;
  const phone = String(formData.get("phone") || "") || null;
  const start_date = String(formData.get("start_date") || "") || null;

  const admin = createAdminClient();

  // 1) Create the auth user (email confirmed so they can log in immediately).
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr || !created.user) {
    throw new Error(authErr?.message ?? "Could not create login.");
  }

  // 2) Create the matching employee record.
  const { error: rowErr } = await admin.from("employees").insert({
    id: created.user.id,
    full_name,
    email,
    role,
    department,
    job_title,
    phone,
    start_date,
    status: "active",
  });
  if (rowErr) {
    // roll back the auth user if the profile insert fails
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(rowErr.message);
  }

  revalidatePath("/employees");
  redirect("/employees");
}
