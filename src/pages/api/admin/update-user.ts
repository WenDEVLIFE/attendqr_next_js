import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type RequestBody = {
  id: number;
  userData: {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  };
};

type ResponseData = {
  success: boolean;
  user?: object;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) {
    return res.status(500).json({
      success: false,
      error: 'Missing Supabase server environment variables.',
    });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey
  );

  const { id, userData } = req.body as RequestBody;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: id',
    });
  }

  const updatePayload: any = {};
  if (userData.username) updatePayload.username = userData.username;
  if (userData.email) updatePayload.email = userData.email;
  if (userData.role) updatePayload.role = userData.role;
  if (userData.password) updatePayload.password = userData.password;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updatePayload)
    .eq('id', id)
    .select('id, username, email, role, created_at')
    .single();

  if (error) {
    console.error('[update-user] Supabase update error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, user: data });
}
