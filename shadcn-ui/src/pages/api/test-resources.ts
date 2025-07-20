import { NextApiRequest, NextApiResponse } from 'next';
import { ResourceService } from '@/lib/database';

const resourceService = new ResourceService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    const allResources = resourceService.getAllResources();
    
    // Test filtering
    const filteredResources = resourceService.getResourcesByFilter({
      type: 'course',
      level: 'beginner'
    });

    // Test getting a specific resource
    const firstResource = allResources.length > 0 ? resourceService.getResourceById(allResources[0].id) : null;

    // Test stats
    const stats = resourceService.getResourceStats();

    res.status(200).json({
      success: true,
      tests: {
        databaseConnection: 'OK',
        totalResources: allResources.length,
        filteredResources: filteredResources.length,
        firstResource: firstResource ? 'Found' : 'Not found',
        stats: stats
      },
      sampleData: allResources.slice(0, 3).map(resource => ({
        id: resource.id,
        title: resource.title,
        type: resource.type,
        level: resource.level,
        course: resource.course
      }))
    });
  } catch (error) {
    console.error('Error testing resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test resources',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 