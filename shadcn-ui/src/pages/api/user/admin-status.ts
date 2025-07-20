import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    const user = userService.findUserByEmail(email as string);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found in database'
      });
    }

    const isAdmin = userService.isUserAdminByEmail(email as string);
    
    res.status(200).json({
      success: true,
      isAdmin,
      email: email as string
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check admin status'
    });
  }
} 