import { NextApiRequest, NextApiResponse } from 'next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import formidable dynamically to avoid SSR issues
    const formidable = require('formidable');
    
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.image;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'image';
    const extension = originalName.split('.').pop() || 'jpg';
    const filename = `event-${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // For formidable v2, the file is already at the correct path
    // Just copy it to our uploads directory
    const fs = require('fs');
    fs.copyFileSync(file.filepath, filepath);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;

    res.status(200).json({
      success: true,
      url: publicUrl,
      filename: filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
} 