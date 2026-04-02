import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('GET-ACTIVITIES API: Handler called', { method: req.method, limit: req.query.limit });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  // Validate environment variables
  console.log('GET-ACTIVITIES API: Checking env vars...');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) {
    console.warn('GET-ACTIVITIES API: Missing Supabase server environment variables');
    console.warn('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING');
    console.warn('SERVICE_ROLE_KEY:', serviceKey ? 'PRESENT' : 'MISSING');
    return res.status(500).json({
      success: false,
      error: 'Missing Supabase server environment variables',
    });
  }

  try {
    // Create admin client with service role key
    console.log('GET-ACTIVITIES API: Creating Supabase client...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey,
      { auth: { persistSession: false } }
    );

    // Get limit from query params (default 50)
    const limit = parseInt(req.query.limit as string) || 50;
    console.log('GET-ACTIVITIES API: Fetching activities with limit:', limit);

    // Fetch activities from activity_logs table
    const { data, error } = await supabase
      .from('activity_logs')
      .select('report_id, activity_type, description, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('GET-ACTIVITIES API: Supabase query error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log('GET-ACTIVITIES API: Success! Returning', data?.length || 0, 'activities');
    return res.status(200).json({
      success: true,
      activities: data,
    });
  } catch (error: any) {
    console.error('GET-ACTIVITIES API: Catch block error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch activities',
    });
  }
}
