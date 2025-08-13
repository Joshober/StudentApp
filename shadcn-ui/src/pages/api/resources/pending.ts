import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService, UserService } from '@/lib/database';

const resourceService = new ResourceService();
const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
        error: 'Admin access required'
      });
    }

    // Get all pending resources (admin can see all pending resources)
    const pendingResources = resourceService.getPendingResources();
    
    res.status(200).json({
      success: true,
      data: pendingResources,
      count: pendingResources.length
    });
  } catch (error) {
    console.error('Error fetching pending resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending resources'
    });
  }
} 