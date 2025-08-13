import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user data from cookies (set by OAuth callbacks)
    const userDataCookie = req.cookies.user_data;
    
    if (!userDataCookie) {
      // No authenticated user found
      return res.status(200).json({
        success: true,
        user: null
      });
    }

    let userData;
    try {
      userData = JSON.parse(userDataCookie);
    } catch (error) {
      console.error('Error parsing user data cookie:', error);
      return res.status(200).json({
        success: true,
        user: null
      });
    }

    // Check if user exists in database
    let user = userService.findUserByEmail(userData.email);
    
    if (!user) {
      // Create user if doesn't exist
      const userId = await userService.createUser(
        userData.email, 
        '', // No password for OAuth users
        userData.name || userData.email.split('@')[0], 
        undefined, // No API key initially
        false // Not admin by default
      );
      user = userService.findUserByEmail(userData.email);
    }

    if (!user) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create or find user'
      });
    }

    // Check if user is admin
    const isAdmin = userService.isUserAdminByEmail(userData.email);
    
    const responseData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: isAdmin ? 'admin' : 'student',
      is_admin: isAdmin
    };

    res.status(200).json({
      success: true,
      user: responseData
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current user'
    });
  }
} 