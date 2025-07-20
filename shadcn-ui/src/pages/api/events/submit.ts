import { NextApiRequest, NextApiResponse } from 'next';
import { EventService, UserService } from '@/lib/database';

const eventService = new EventService();
const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      title,
      description,
      date,
      time,
      location,
      type,
      capacity,
      speaker,
      tags,
      submitterNotes,
      image
    } = req.body;

    // Validation
    if (!title || !description || !date || !time || !location || !type || !capacity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Get current user from session/cookie (for now, use regular user email for testing)
    const currentUserEmail = 'user@example.com'; // In real app, get from session
    const currentUserName = 'Regular User';

    // Check if the submitter is an admin
    const isAdmin = userService.isUserAdminByEmail(currentUserEmail);
    
    const eventData = {
      title,
      description,
      date,
      time,
      location,
      type,
      capacity: parseInt(capacity),
      tags: Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim()),
      speaker: speaker || null,
      image: image || '/api/placeholder/400/250',
      submitter_email: currentUserEmail,
      submitter_name: currentUserName,
      is_approved: isAdmin // Auto-approve if admin, otherwise needs approval
    };

    const success = eventService.addEvent(eventData);

    if (success) {
      res.status(201).json({
        success: true,
        message: 'Event submitted successfully and added to the collection!'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to submit event'
      });
    }
  } catch (error) {
    console.error('Error submitting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit event'
    });
  }
} 