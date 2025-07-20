import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService } from '@/lib/database';

const resourceService = new ResourceService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type, level, course, search, userEmail, isAdmin, includePending } = req.query;
      
      const filters = {
        type: type as string,
        level: level as string,
        course: course as string,
        search: search as string,
        userEmail: userEmail as string,
        isAdmin: isAdmin === 'true',
        includePending: includePending === 'true'
      };

      // For non-authenticated users, show only approved resources
      if (!userEmail) {
        filters.isAdmin = false;
        filters.includePending = false;
      }

      const resources = resourceService.getResourcesByFilter(filters);
      
      res.status(200).json({
        success: true,
        data: resources,
        count: resources.length
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch resources'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        level,
        course,
        tags,
        type,
        duration,
        author,
        rating,
        thumbnail,
        link
      } = req.body;

      // Validate required fields
      if (!title || !description || !level || !course || !tags || !type || !author || !link) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const success = resourceService.addResource({
        title,
        description,
        level,
        course,
        tags: Array.isArray(tags) ? tags : [tags],
        type,
        duration,
        author,
        rating,
        thumbnail,
        link
      });

      if (success) {
        res.status(201).json({
          success: true,
          message: 'Resource added successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to add resource'
        });
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add resource'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
} 