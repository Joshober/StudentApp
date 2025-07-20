import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService, UserService } from '@/lib/database';

const resourceService = new ResourceService();
const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resourceId, userEmail } = req.body;

    if (!resourceId || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Resource ID and user email are required'
      });
    }

    // Check if user is admin
    const isAdmin = userService.isUserAdminByEmail(userEmail);
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