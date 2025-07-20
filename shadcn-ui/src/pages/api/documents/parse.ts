import { NextApiRequest, NextApiResponse } from 'next';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName || !fileType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let text = '';

    switch (fileType) {
      case 'application/pdf':
        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(fileData, 'base64');
          const result = await pdf(buffer);
          text = result.text;
        } catch (error) {
          return res.status(400).json({ 
            error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
        break;

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(fileData, 'base64');
          const result = await mammoth.extractRawText({ buffer });
          text = result.value;
        } catch (error) {
          return res.status(400).json({ 
            error: `Failed to parse Word document: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
        break;

      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Calculate metadata
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = text.length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    const metadata = {
      fileName,
      fileType,
      wordCount,
      characterCount,
      readingTime
    };

    res.status(200).json({
      text,
      metadata
    });

  } catch (error) {
    console.error('Document parsing error:', error);
    res.status(500).json({ 
      error: 'Failed to parse document' 
    });
  }
} 