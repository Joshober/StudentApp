import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/database';

const eventService = new EventService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'User email parameter is required'
      });
    }

    const pendingEvents = eventService.getPendingEventsByUser(userEmail as string);

    res.status(200).json({
      success: true,
      data: pendingEvents
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending events'
    });
  }
} 