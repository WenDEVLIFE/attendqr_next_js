import { supabase } from "@/src/lib/supabase/client";

export interface DashboardStats {
  totalUsers: number;
  activeScansToday: number;
  successfulLoginsToday: number;
  failedAttemptsToday: number;
}

/**
 * Fetches summary statistics for the admin dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // 1. Total Users (Exact count)
  const { count: totalUsers, error: usersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (usersError) {
    console.error("Dashboard Service: Total Users error:", usersError.message);
  }

  // 2. Active Scans Today
  const { count: scansToday, error: scansError } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("activity_type", "scan")
    .gte("created_at", todayISO);

  if (scansError) {
    console.error("Dashboard Service: Scans error:", scansError.message);
  }

  // 3. Successful Logins Today
  const { count: loginsToday, error: loginsError } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("activity_type", "user_login")
    .gte("created_at", todayISO);

  if (loginsError) {
    console.error("Dashboard Service: Logins error:", loginsError.message);
  }

  // 4. Failed Attempts Today
  const { count: failedToday, error: failedError } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("activity_type", "login_failed")
    .gte("created_at", todayISO);

  if (failedError) {
    console.error("Dashboard Service: Failed attempts error:", failedError.message);
  }

  return {
    totalUsers: totalUsers || 0,
    activeScansToday: scansToday || 0,
    successfulLoginsToday: loginsToday || 0,
    failedAttemptsToday: failedToday || 0,
  };
}

/**
 * Fetches the most recent activities for the dashboard alerts.
 * @param limit - Max number of activities to fetch.
 */
export async function getRecentDashboardActivities(limit: number = 5) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("report_id, activity_type, description, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Dashboard Service: Recent activities error:", error.message);
    return [];
  }

  return data || [];
}
