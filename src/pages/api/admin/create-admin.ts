import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/src/lib/supabase/hash';

// Use service role key for admin insert (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type RequestBody = {
    username: string;
    email: string;
    password: string;
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
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { username, email, password } = req.body as RequestBody;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: username, email, password',
        });
    }

    // Check if admin with this email already exists
    const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existing) {
        return res.status(409).json({
            success: false,
            error: `Admin with email "${email}" already exists.`,
        });
    }

    // Insert admin user (plain password — trigger will hash it)
    const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
            username,
            email,
            password,
            role: 'admin',
        })
        .select('id, username, email, role, created_at')
        .single();

    if (error) {
        console.error('[create-admin] Supabase insert error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    console.log(`[create-admin] Admin created: ${email}`);
    return res.status(201).json({ success: true, user: data });
}
