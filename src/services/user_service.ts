import { supabase } from "@/src/lib/supabase/client";
import { logActivity } from "./activity.service";

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
  const { data, error } = await supabase
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

  if (error) {
    console.error("Error creating user:", error.message);
    throw new Error(error.message);
  }

  // this will check if the user was created successfully and log the activity, but it won't fail the user creation if the activity logging fails. 
  if (data?.id) {
    try {
      await logActivity({
        user_id: data.id,
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
