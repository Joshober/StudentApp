import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, isAdmin } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isAdmin must be a boolean value'
      });
    }

    // Find the user by email
    const user = userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update the user's admin status
    const success = userService.updateUserAdminStatus(user.id, isAdmin);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: `Successfully ${isAdmin ? 'granted' : 'revoked'} admin privileges for ${email}`,
        isAdmin
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update admin status'
      });
    }
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle admin status'
    });
  }
} 