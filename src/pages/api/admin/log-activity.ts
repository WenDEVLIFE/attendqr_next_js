import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type RequestBody = {
  report_id: number;
  activity_type: string;
  description: string;
};

type ResponseData = {
  success: boolean;
  activity?: object;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
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

    const { report_id, activity_type, description } = req.body as RequestBody;

    if (!report_id || !activity_type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: report_id, activity_type, description',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .insert({
        report_id,
        activity_type,
        description,
      })
      .select('report_id, activity_type, description, created_at')
      .single();

    if (error) {
      console.error('[log-activity] Supabase insert error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({ success: true, activity: data });
  } catch (error) {
    console.error('[log-activity] Unhandled error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to log activity.',
    });
  }
}