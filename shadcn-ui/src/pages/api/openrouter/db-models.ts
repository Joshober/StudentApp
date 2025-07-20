import type { NextApiRequest, NextApiResponse } from 'next';
import { ModelService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const modelService = new ModelService();
    const { type = 'all', search } = req.query;

    let models: any[] = [];
    let stats: any = {};

    switch (type) {
      case 'free':
        models = modelService.getFreeModels();
        break;
      case 'paid':
        models = modelService.getPaidModels();
        break;
      case 'search':
        if (typeof search === 'string' && search.trim()) {
          models = modelService.searchModels(search.trim());
        } else {
          models = modelService.getAllModels();
        }
        break;
      default:
        models = modelService.getAllModels();
    }

    // Get sync statistics
    stats = modelService.getSyncStats();

    // Transform models to match the expected format
    const transformedModels = models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      context_length: model.context_length,
      pricing: {
        prompt: model.pricing_prompt,
        completion: model.pricing_completion
      },
      architecture: {
        modality: model.architecture_modality,
        tokenizer: model.architecture_tokenizer
      },
      top_provider: {
        is_moderated: model.top_provider_is_moderated
      },
      tags: model.tags ? model.tags.split(',').filter((tag: string) => tag.trim()) : [],
      status: model.status,
      deprecated: model.deprecated,
      is_free: model.is_free,
      last_updated: model.last_updated
    }));

    res.status(200).json({
      models: transformedModels,
      stats,
      total: transformedModels.length,
      source: 'database',
      last_sync: stats.last_sync
    });

  } catch (error) {
    console.error('Database models API error:', error);
    res.status(500).json({
      error: 'Failed to fetch models from database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 