import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type RequestBody = {
  username: string;
  email: string;
  password: string;
  role?: string;
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

  const { username, email, password, role } = req.body as RequestBody;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: username, email, password',
    });
  }

  const { data: existingByEmail } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingByEmail) {
    return res.status(409).json({
      success: false,
      error: `Admin with email "${email}" already exists.`,
    });
  }

  const { data: existingByUsername } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existingByUsername) {
    return res.status(409).json({ success: false, error: 'Username already exists.' });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      username,
      email,
      password,
      role: role || 'user',
    })
    .select('id, username, email, role, created_at')
    .single();

  if (error) {
    console.error('[create-user] Supabase insert error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, user: data });
}