import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/database';

const eventService = new EventService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  try {
    const { eventId, userEmail } = req.body;

    if (!eventId || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Event ID and user email are required'
      });
    }

    // Check if event exists and is approved
    const event = eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    if (!event.is_approved) {
      return res.status(400).json({
        success: false,
        error: 'Event is not yet approved'
      });
    }

    // Check if event is full
    if (event.registered >= event.capacity) {
      return res.status(400).json({
        success: false,
        error: 'Event is full'
      });
    }

    // Check if user is already registered
    const isAlreadyRegistered = eventService.isUserRegisteredForEvent(eventId, userEmail);
    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        error: 'User is already registered for this event'
      });
    }

    // Register user for the event
    const registration = eventService.registerUserForEvent(eventId, userEmail);

    if (!registration) {
      return res.status(500).json({
        success: false,
        error: 'Failed to register for event'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: registration
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register for event'
    });
  }
}
