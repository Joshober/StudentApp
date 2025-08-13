import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/database';

const eventService = new EventService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Event ID is required'
    });
  }

  switch (req.method) {
    case 'GET':
      try {
        const event = eventService.getEventById(id);
        
        if (!event) {
          return res.status(404).json({
            success: false,
            error: 'Event not found'
          });
        }

        res.status(200).json({
          success: true,
          data: event
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch event'
        });
      }
      break;

    case 'PUT':
      try {
        const { title, description, date, time, location, type, capacity, speaker, tags, contact_email, contact_phone, website, additional_info } = req.body;

        // Validate required fields
        if (!title || !description || !date || !time || !location || !type) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields'
          });
        }

        const updatedEvent = eventService.updateEvent(id, {
          title,
          description,
          date,
          time,
          location,
          type,
          capacity: capacity || 50,
          speaker,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : tags,
          contact_email,
          contact_phone,
          website,
          additional_info
        });

        if (!updatedEvent) {
          return res.status(404).json({
            success: false,
            error: 'Event not found'
          });
        }

        res.status(200).json({
          success: true,
          data: updatedEvent
        });
      } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update event'
        });
      }
      break;

    case 'DELETE':
      try {
        const deleted = eventService.deleteEvent(id);
        
        if (!deleted) {
          return res.status(404).json({
            success: false,
            error: 'Event not found'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Event deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete event'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
  }
}
