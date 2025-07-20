import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, we'll use a default user email
    // In a real application, you would get the user from the session/token
    const defaultEmail = 'user@example.com';
    
    // Check if user exists in database
    let user = userService.findUserByEmail(defaultEmail);
    
    if (!user) {
      // Create user if doesn't exist
      const userId = await userService.createUser(defaultEmail, '', 'Test User', undefined, false);
      user = userService.findUserByEmail(defaultEmail);
    }

    // Check if user is admin
    const isAdmin = userService.isUserAdminByEmail(defaultEmail);
    
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: isAdmin ? 'admin' : 'student',
      is_admin: isAdmin
    };

    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current user'
    });
  }
} 