import { supabase } from "@/src/lib/supabase/client";

let activitySequence = 0;

export interface ActivityData {
    report_id?: number;
    activity_type: string;
    description: string;
    created_at?: string;
}

/** * Logs a user activity in the Supabase 'activities' table.
 * @param activityData - The activity information to insert.
 * @returns An object containing the created activity data or an error.
 */
export async function logActivity(activityData: ActivityData) {
    const generatedReportId = activityData.report_id ?? (Date.now() * 1000 + (activitySequence++ % 1000));

    const response = await fetch('/api/admin/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            report_id: generatedReportId,
            activity_type: activityData.activity_type,
            description: activityData.description,
        }),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : { success: false, error: await response.text() };

    if (!response.ok || !payload.success) {
        const errorMessage = payload?.error || 'Failed to log activity.';
        if (String(errorMessage).includes('Missing Supabase server environment variables')) {
            console.warn('Activity logging skipped:', errorMessage);
            return null;
        }

        console.error('Error logging activity:', errorMessage);
        throw new Error(errorMessage);
    }

    return payload.activity;
}

/** * Retrieves recent activities for a specific report.
 * @param reportId - The ID of the report whose activities to retrieve.
 * @param limit - The maximum number of activities to retrieve (default is 10).
 * @returns An array of activity data or an error.
 */
export async function getUserActivities(reportId: number, limit: number = 10) {
    const { data, error } = await supabase
        .from("activity_logs")
        .select("report_id, activity_type, description, created_at")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error retrieving user activities:", error.message);
        throw new Error("Failed to retrieve user activities.");
    }

    return data;
}

/** * Retrieves the most recent activities across the entire system.
 * @param limit - The maximum number of activities to retrieve (default is 50).
 * @returns An array of activity data or an error.
 */
export async function getRecentActivitiesWithUsers(limit: number = 50) {
    try {
        const response = await fetch(`/api/admin/get-activities?limit=${limit}`);
        
        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : { success: false, error: await response.text() };

        console.log('Activity API Response:', { status: response.status, payload });

        if (!response.ok || !payload.success) {
            const errorMessage = payload?.error || 'Failed to fetch activities.';
            console.error('Error retrieving system activities:', errorMessage);
            throw new Error(errorMessage);
        }

        return payload.activities || [];
    } catch (error: any) {
        console.error("Error retrieving system activities - Full error:", error);
        console.error("Error message:", error.message);
        throw error;
    }
}   
