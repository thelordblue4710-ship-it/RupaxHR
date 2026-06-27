import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/Shell";
import { clockIn, clockOut } from "./actions";

function fmt(ts: string) {
  return new Date(ts).toLocaleString([], {
    weekday: "short", hour: "2-digit", minute: "2-digit",
    day: "numeric", month: "short",
  });
}

function duration(inTs: string, outTs: string) {
  const ms = new Date(outTs).getTime() - new Date(inTs).getTime();
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default async function ClockPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: open } = await supabase
    .from("time_entries")
    .select("id, clock_in")
    .is("clock_out", null)
    .maybeSingle();

  const { data: recent } = await supabase
    .from("time_entries")
    .select("id, clock_in, clock_out")
    .not("clock_out", "is", null)
    .order("clock_in", { ascending: false })
    .limit(10);

  return (
    <Shell profile={profile} active="clock">
      <h1 className="text-2xl font-semibold">Time clock</h1>

      <div className="card mt-6 p-8 text-center">
        {open ? (
          <>
            <p className="text-ink/60 text-sm">Clocked in since</p>
            <p className="mt-1 text-lg font-medium">{fmt(open.clock_in)}</p>
            <form action={clockOut} className="mt-6">
              <button className="btn-primary px-8 py-3 text-base">Clock out</button>
            </form>
          </>
        ) : (
          <>
            <p className="text-ink/60 text-sm">You're not clocked in.</p>
            <form action={clockIn} className="mt-6">
              <button className="btn-primary px-8 py-3 text-base">Clock in</button>
            </form>
          </>
        )}
      </div>

      <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
        Recent entries
      </h2>
      <div className="card divide-y divide-line">
        {(recent ?? []).length === 0 && (
          <div className="p-4 text-sm text-ink/60">No completed entries yet.</div>
        )}
        {(recent ?? []).map((e) => (
          <div key={e.id} className="p-4 flex items-center justify-between text-sm">
            <span>{fmt(e.clock_in)}</span>
            <span className="text-ink/50">→ {fmt(e.clock_out!)}</span>
            <span className="font-medium">{duration(e.clock_in, e.clock_out!)}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
