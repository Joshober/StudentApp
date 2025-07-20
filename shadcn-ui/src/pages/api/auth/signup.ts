import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name, openrouterApiKey } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const userService = new UserService();

    // Check if user already exists
    const existingUser = userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const userId = await userService.createUser(email, password, name, openrouterApiKey);
    
    if (!userId) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Get the created user data
    const user = userService.findUserByEmail(email);
    if (!user) {
      return res.status(500).json({ error: 'Failed to retrieve created user' });
    }

    // Return user data (without password)
    const { password: _, ...userData } = user;
    
    return res.status(201).json({
      user: userData,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 