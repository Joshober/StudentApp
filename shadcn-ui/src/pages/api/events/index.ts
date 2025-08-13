import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/database';

const eventService = new EventService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, userEmail, isAdmin, limit } = req.query;

    // Get approved events only
    const events = eventService.getApprovedEvents({
      type: type as string,
      userEmail: userEmail as string,
      isAdmin: isAdmin === 'true',
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
} 