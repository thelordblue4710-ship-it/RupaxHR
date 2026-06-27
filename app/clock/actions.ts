"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function clockIn() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: open } = await supabase
    .from("time_entries")
    .select("id")
    .eq("employee_id", user.id)
    .is("clock_out", null)
    .maybeSingle();

  if (open) throw new Error("You're already clocked in.");

  const { error } = await supabase
    .from("time_entries")
    .insert({ employee_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/clock");
}

export async function clockOut() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: open } = await supabase
    .from("time_entries")
    .select("id")
    .eq("employee_id", user.id)
    .is("clock_out", null)
    .maybeSingle();

  if (!open) throw new Error("You're not clocked in.");

  const { error } = await supabase
    .from("time_entries")
    .update({ clock_out: new Date().toISOString() })
    .eq("id", open.id);
  if (error) throw new Error(error.message);

  revalidatePath("/clock");
}
