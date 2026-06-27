"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Manager creates a shift. RLS guarantees only managers can insert.
export async function createShift(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const employee_id = String(formData.get("employee_id"));
  const work_date = String(formData.get("work_date"));
  const start_time = String(formData.get("start_time"));
  const end_time = String(formData.get("end_time"));
  const location = String(formData.get("location") || "") || null;
  const notes = String(formData.get("notes") || "") || null;
  // "Send" = publish immediately. Otherwise it's saved as a draft.
  const publish = formData.get("publish") === "on";

  const { error } = await supabase.from("schedules").insert({
    employee_id,
    work_date,
    start_time,
    end_time,
    location,
    notes,
    published: publish,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/schedules");
  redirect("/schedules");
}

// Publish ("send") a draft shift to the employee.
export async function publishShift(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("schedules")
    .update({ published: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/schedules");
}
