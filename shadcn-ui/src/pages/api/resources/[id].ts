import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService } from '@/lib/database';

const resourceService = new ResourceService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const resourceId = parseInt(id as string);

  if (isNaN(resourceId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID'
    });
  }

  if (req.method === 'GET') {
    try {
      const resource = resourceService.getResourceById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch resource'
      });
    }
  } else if (req.method === 'PUT') {
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
        link
      } = req.body;

      // Validate required fields
      if (!title || !description || !level || !course || !tags || !type || !author || !link) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const success = resourceService.updateResource(resourceId, {
        title,
        description,
        level,
        course,
        tags: Array.isArray(tags) ? tags : [tags],
        type,
        duration,
        author,
        link
      });

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Resource updated successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update resource'
        });
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update resource'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const success = resourceService.deleteResource(resourceId);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Resource deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete resource'
        });
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete resource'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
} 