import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");
    const { data: { user: caller }, error: callerError } = await admin.auth.getUser(token);
    if (callerError || !caller) throw new Error("Unauthorized");
    const { data: callerProfile } = await admin.from("profiles").select("role").eq("id", caller.id).maybeSingle();
    const { count: profileCount, error: profileCountError } = await admin.from("profiles").select("id", { count: "exact", head: true });
    if (profileCountError) throw profileCountError;
    if (profileCount !== 0 && callerProfile?.role !== "super_admin") throw new Error("Only super admins can create users");
    if (profileCount === 0) {
      const { error: bootstrapError } = await admin.from("profiles").upsert({ id: caller.id, email: caller.email ?? "", full_name: caller.user_metadata?.full_name ?? caller.email ?? "Administrator", role: "super_admin", is_active: true }, { onConflict: "id" });
      if (bootstrapError) throw bootstrapError;
    }
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const role = String(body.role ?? "");
    const department = body.department ? String(body.department).trim() : null;
    if (!email || !fullName || !["manager", "sales_agent", "logistics_officer", "content_manager"].includes(role)) throw new Error("Email, full name, and a valid role are required");
    const { data: authData, error: authError } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: fullName } });
    if (authError || !authData.user) throw authError ?? new Error("Could not create user");
    const { error: profileError } = await admin.from("profiles").upsert({ id: authData.user.id, email, full_name: fullName, role, department, is_active: true }, { onConflict: "id" });
    if (profileError) { await admin.auth.admin.deleteUser(authData.user.id); throw profileError; }
    return new Response(JSON.stringify({ user: { id: authData.user.id, email: authData.user.email } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Could not create user" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
