import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService, UserService } from '@/lib/database';

const resourceService = new ResourceService();
const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resourceId } = req.body;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Resource ID is required'
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
        error: 'Only admins can reject resources'
      });
    }

    const success = resourceService.rejectResource(parseInt(resourceId));

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Resource rejected successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to reject resource'
      });
    }
  } catch (error) {
    console.error('Error rejecting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject resource'
    });
  }
} 