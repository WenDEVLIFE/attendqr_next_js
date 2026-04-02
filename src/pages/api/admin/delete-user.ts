import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type RequestBody = {
    id: number;
};

type ResponseData = {
    success: boolean;
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

    const { id } = req.body as RequestBody;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Missing required field: id',
        });
    }

    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

    if (error) {
        console.error('[delete-user] Supabase delete error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true });
}
