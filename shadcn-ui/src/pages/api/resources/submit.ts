import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService, UserService } from '@/lib/database';

const resourceService = new ResourceService();
const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get current user from session/cookie (for testing, use admin email)
      const currentUser = {
        email: 'jobersteadt@outlook.com',
        name: 'Admin User'
      };

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
        submitterNotes,
        thumbnail
      } = req.body;

      // Validate required fields
      if (!title || !description || !level || !course || !tags || !type || !author || !link) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if the submitter is an admin
      const isAdmin = userService.isUserAdminByEmail(currentUser.email);
      
      // Add the resource (auto-approve if admin, otherwise pending)
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
        thumbnail: thumbnail || '/api/placeholder/300/200',
        link,
        submitter_email: currentUser.email,
        submitter_name: currentUser.name,
        is_approved: isAdmin // Auto-approve if admin, otherwise needs approval
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