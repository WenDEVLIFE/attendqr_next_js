import { supabase } from "@/src/lib/supabase/client";

export interface ActivityData {
    id?: number;
    user_id: number;
    activity_type: string;
    description: string;
    created_at?: string;
    }

/** * Logs a user activity in the Supabase 'activities' table.
 * @param activityData - The activity information to insert.
 * @returns An object containing the created activity data or an error.
 */
export async function logActivity(activityData: ActivityData) {
    const { data, error } = await supabase
    .from("activities")
    .insert([
        {
        user_id: activityData.user_id,
        activity_type: activityData.activity_type,
        description: activityData.description,
        },
    ])
    .select("id, user_id, activity_type, description, created_at")
    .single();

    if (error) {
    console.error("Error logging activity:", error.message);
    throw new Error("Failed to log activity.");
    }

    return data;
}   

/** * Retrieves recent activities for a specific user.
 * @param userId - The ID of the user whose activities to retrieve.
 * @param limit - The maximum number of activities to retrieve (default is 10).
 * @returns An array of activity data or an error.
 */
export async function getUserActivities(userId: number, limit: number = 10) {
    const { data, error } = await supabase
    .from("activities")
    .select("id, user_id, activity_type, description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

    if (error) {
    console.error("Error retrieving user activities:", error.message);
    throw new Error("Failed to retrieve user activities.");
    }

    return data;
}   

