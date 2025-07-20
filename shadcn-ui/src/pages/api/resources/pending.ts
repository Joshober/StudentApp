import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService, UserService } from '@/lib/database';

const resourceService = new ResourceService();
const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'User email is required'
      });
    }

    // Check if user is admin
    const isAdmin = userService.isUserAdminByEmail(userEmail as string);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can view pending resources'
      });
    }

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