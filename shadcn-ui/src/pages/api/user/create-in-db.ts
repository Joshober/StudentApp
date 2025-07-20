import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required'
      });
    }

    // Check if user already exists in database
    const existingUser = userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already exists in database',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          is_admin: existingUser.is_admin
        }
      });
    }

    // Create user in database
    const userId = await userService.createUser(
      email,
      'password123', // Default password (not used for auth, just for database)
      name,
      undefined, // No API key initially
      false // Not admin initially
    );

    if (userId) {
      const newUser = userService.findUserById(userId);
      res.status(201).json({
        success: true,
        message: 'User created successfully in database',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          is_admin: newUser.is_admin
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create user in database'
      });
    }
  } catch (error) {
    console.error('Error creating user in database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user in database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 