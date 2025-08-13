import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/database';

const eventService = new EventService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  try {
    const { eventId, userEmail } = req.query;

    if (!eventId || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Event ID and user email are required'
      });
    }

    const isRegistered = eventService.isUserRegisteredForEvent(eventId as string, userEmail as string);

    res.status(200).json({
      success: true,
      isRegistered
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check registration'
    });
  }
}
