import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService } from '@/lib/database';

const resourceService = new ResourceService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get current user from session/cookie
      const userResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/current-user`);
      const userData = await userResponse.json();
      
      if (!userData.success || !userData.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentUser = userData.user;

      const {
        title,
        description,
        level,
        course,
        tags,
        type,
        duration,
        author,
        link,
        submitterNotes
      } = req.body;

      // Validate required fields
      if (!title || !description || !level || !course || !tags || !type || !author || !link) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Add the resource as pending (not approved)
      const success = resourceService.addResource({
        title,
        description,
        level,
        course,
        tags: Array.isArray(tags) ? tags : [tags],
        type,
        duration,
        author,
        rating: 0, // New submissions start with 0 rating
        thumbnail: '/api/placeholder/300/200',
        link,
        submitter_email: currentUser.email,
        submitter_name: currentUser.name,
        is_approved: false // New submissions are pending approval
      });

      if (success) {
        res.status(201).json({
          success: true,
          message: 'Resource submitted successfully and added to the collection!'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to submit resource'
        });
      }
    } catch (error) {
      console.error('Error submitting resource:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit resource'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
} 