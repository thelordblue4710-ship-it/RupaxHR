import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: "manager" | "employee";
  department: string | null;
  job_title: string | null;
};

// Returns the signed-in user's employee profile, or redirects to login.
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("employees")
    .select("id, full_name, email, role, department, job_title")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  return profile as Profile;
}
