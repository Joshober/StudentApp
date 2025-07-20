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
    
    let pendingResources;
    if (isAdmin) {
      // Admins can see all pending resources
      pendingResources = resourceService.getPendingResources();
    } else {
      // Regular users can only see their own pending resources
      pendingResources = resourceService.getPendingResourcesByUser(userEmail as string);
    }
    
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