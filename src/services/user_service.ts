import { supabase } from "@/src/lib/supabase/client";
import { logActivity } from "./activity_service";

export interface UserData {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role?: string;
  created_at?: string;
}

/**
 * Checks if a user already exists in the database by email or username.
 * @param email - The email to check.
 * @param username - The username to check.
 * @returns A boolean indicating if the user exists.
 */
export async function checkUserExists(email: string, username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();

  if (error) {
    console.error("Error checking user existence:", error.message);
    return false;
  }

  return !!data;
}

/**
 * Creates a new user in the Supabase 'users' table.
 * Note: Password hashing is handled by the database trigger (pgcrypto).
 * @param userData - The user information to insert.
 * @returns An object containing the created user data or an error.
 */
export async function createUser(userData: UserData) {
  // 1. Check for existing user first
  const exists = await checkUserExists(userData.email, userData.username);
  if (exists) {
    throw new Error("User with this email or username already exists.");
  }

  // 2. Insert new user
  let { data, error } = await supabase
    .from("users")
    .insert([
      {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role || "user",
      },
    ])
    .select("id, username, email, role, created_at")
    .single();

  if (error && error.message.toLowerCase().includes("row-level security")) {
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'user',
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : { success: false, error: await response.text() };

    if (!response.ok || !payload.success) {
      const fallbackMessage = payload?.error || error.message;
      console.error("Error creating user via fallback API:", fallbackMessage);
      throw new Error(fallbackMessage);
    }

    data = payload.user;
    error = null;
  }

  if (error) {
    console.error("Error creating user:", error.message);
    throw new Error(error.message);
  }

  // this will check if the user was created successfully and log the activity, but it won't fail the user creation if the activity logging fails. 
  if (data?.id) {
    try {
      await logActivity({
        activity_type: "user_created",
        description: `User account created for ${data.username}`,
      });
    } catch (activityError) {
      // Do not fail user creation if activity logging fails.
      console.error("Activity logging failed after user creation:", activityError);
    }
  }

  return data;
}

/**
 * Updates an existing user record.
 * @param id - The ID of the user to update.
 * @param userData - The new data to apply.
 * @returns The updated user record.
 */
export async function updateUser(id: number, userData: Partial<UserData>) {
  const updatePayload: any = {
    username: userData.username,
    email: userData.email,
    role: userData.role,
  };

  // Only include password if it was provided
  if (userData.password) {
    updatePayload.password = userData.password;
  }

  let { data, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", id)
    .select("id, username, email, role, created_at")
    .single();

  if (error && (error.message.toLowerCase().includes("row-level security") || error.message.toLowerCase().includes("coerce"))) {
    const response = await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        userData: updatePayload,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : { success: false, error: await response.text() };

    if (!response.ok || !payload.success) {
      const fallbackMessage = payload?.error || error.message;
      console.error("Error updating user via fallback API:", fallbackMessage);
      throw new Error(fallbackMessage);
    }

    data = payload.user;
    error = null;
  }

  if (error) {
    console.error("Error updating user:", error.message);
    throw new Error(error.message);
  }

  if (data?.id) {
    try {
      await logActivity({
        activity_type: "user_updated",
        description: `User ${data.username} updated by admin`,
      });
    } catch (activityError) {
      console.error("Activity logging failed after user update:", activityError);
    }
  }

  return data;
}

/**
 * Permanently deletes a user record.
 * @param id - The ID of the user to delete.
 */
export async function deleteUser(id: number) {
  // Fetch user info for logging before deletion
  const { data: user } = await supabase
    .from("users")
    .select("username")
    .eq("id", id)
    .single();

  let { error } = await supabase.from("users").delete().eq("id", id);

  if (error && error.message.toLowerCase().includes("row-level security")) {
    const response = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : { success: false, error: await response.text() };

    if (!response.ok || !payload.success) {
      const fallbackMessage = payload?.error || error.message;
      console.error("Error deleting user via fallback API:", fallbackMessage);
      throw new Error(fallbackMessage);
    }

    error = null;
  }

  if (error) {
    console.error("Error deleting user:", error.message);
    throw new Error(error.message);
  }

  if (user) {
    try {
      // Log deletion activity (with no user_id or a system marker if needed)
      await logActivity({
        activity_type: "user_deleted",
        description: `User ${user.username} (ID: ${id}) was deleted`,
      });
    } catch (activityError) {
      console.error("Activity logging failed after user deletion:", activityError);
    }
  }
}

/**
 * Fetches all users from the 'users' table.
 * @returns A list of users.
 */
export async function getUsers(): Promise<UserData[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}
