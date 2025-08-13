import { NextApiRequest, NextApiResponse } from 'next';
import { EventService, UserService } from '@/lib/database';

const eventService = new EventService();
const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    // Get current user from session/cookie
    const userDataCookie = req.cookies.user_data;
    
    if (!userDataCookie) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let userData;
    try {
      userData = JSON.parse(userDataCookie);
    } catch (error) {
      console.error('Error parsing user data cookie:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid user session'
      });
    }

    // Check if user is admin
    const isAdmin = userService.isUserAdminByEmail(userData.email);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can approve events'
      });
    }

    const success = eventService.approveEvent(eventId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Event approved successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to approve event'
      });
    }
  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve event'
    });
  }
} 