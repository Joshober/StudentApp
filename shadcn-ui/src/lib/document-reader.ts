 

export interface DocumentContent {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    wordCount: number;
    characterCount: number;
    readingTime: number; // in minutes
  };
}

export class DocumentReader {
  private static readonly MAX_CONTENT_LENGTH = 50000; // 50KB
  private static readonly MAX_WORDS_PER_MINUTE = 200;

  /**
   * Safely read and extract text content from various file types
   */
  static async readDocument(file: File): Promise<DocumentContent> {
    console.log('DocumentReader.readDocument called for:', file.name, file.type);
    try {
      // Validate file size
      if (file.size > this.MAX_CONTENT_LENGTH) {
        throw new Error(`File too large. Maximum size is ${this.MAX_CONTENT_LENGTH / 1024}KB`);
      }

      // Validate file type
      if (!this.isSupportedFileType(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      console.log('File validation passed, processing...');

      let text = '';

      switch (file.type) {
        case 'text/plain':
        case 'text/markdown':
        case 'text/csv':
        case 'application/json':
          text = await this.readTextFile(file);
          break;
        
        case 'text/html':
          text = await this.readHtmlFile(file);
          break;
        
        case 'application/pdf':
          text = await this.readPdfFile(file);
          break;
        
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = await this.readWordFile(file);
          break;
        
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }

      console.log('Text extracted, length:', text.length);

      // Sanitize and process the text
      const sanitizedText = this.sanitizeText(text);
      
      // Calculate metadata
      const metadata = this.calculateMetadata(file, sanitizedText);

      console.log('Document processed successfully:', metadata);

      return {
        text: sanitizedText,
        metadata
      };

    } catch (error) {
      console.error('DocumentReader error:', error);
      throw new Error(`Failed to read document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file type is supported
   */
  private static isSupportedFileType(mimeType: string): boolean {
    const supportedTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'text/html',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return supportedTypes.includes(mimeType);
  }

  /**
   * Read plain text files
   */
  private static async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Read HTML files and extract text content
   */
  private static async readHtmlFile(file: File): Promise<string> {
    const htmlContent = await this.readTextFile(file);
    
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Extract text content
    const textContent = doc.body?.textContent || doc.documentElement?.textContent || '';
    
    // Clean up the text
    return textContent
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Read PDF files using server-side API
   */
  private static async readPdfFile(file: File): Promise<string> {
    try {
      // Convert file to base64 for server processing
      const base64Data = await this.fileToBase64(file);
      
      const response = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse PDF');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      throw new Error(`Failed to read PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read Word documents using server-side API
   */
  private static async readWordFile(file: File): Promise<string> {
    try {
      // Convert file to base64 for server processing
      const base64Data = await this.fileToBase64(file);
      
      const response = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse Word document');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      throw new Error(`Failed to read Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert file to base64 string
   */
  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Sanitize text content to prevent injection attacks
   */
  private static sanitizeText(text: string): string {
    let sanitized = text;

    // Remove potentially dangerous content
    sanitized = this.removeScripts(sanitized);
    sanitized = this.removeHtmlTags(sanitized);
    sanitized = this.removeDataUrls(sanitized);
    sanitized = this.removeExcessiveWhitespace(sanitized);
    sanitized = this.limitContentLength(sanitized);

    return sanitized;
  }

  /**
   * Remove script tags and JavaScript code
   */
  private static removeScripts(text: string): string {
    // Remove script tags and their content
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove JavaScript event handlers
    text = text.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove JavaScript function calls
    text = text.replace(/javascript:/gi, '');
    
    // Remove eval() and similar dangerous functions
    text = text.replace(/\beval\s*\(/gi, '');
    text = text.replace(/\bsetTimeout\s*\(/gi, '');
    text = text.replace(/\bsetInterval\s*\(/gi, '');
    
    return text;
  }

  /**
   * Remove HTML tags while preserving text content
   */
  private static removeHtmlTags(text: string): string {
    // Remove dangerous HTML tags
    text = text.replace(/<(iframe|object|embed|form|input|textarea|select|button)\b[^>]*>/gi, '');
    
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');
    
    return text;
  }

  /**
   * Remove data URLs that could contain malicious content
   */
  private static removeDataUrls(text: string): string {
    return text.replace(/data:[^;]+;base64,[^\s"']+/gi, '[REMOVED_DATA_URL]');
  }

  /**
   * Remove excessive whitespace and normalize
   */
  private static removeExcessiveWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Limit content length to prevent abuse
   */
  private static limitContentLength(text: string): string {
    if (text.length > this.MAX_CONTENT_LENGTH) {
      return text.substring(0, this.MAX_CONTENT_LENGTH) + '\n\n[Content truncated due to length]';
    }
    return text;
  }

  /**
   * Calculate document metadata
   */
  private static calculateMetadata(file: File, text: string) {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = text.length;
    const readingTime = Math.ceil(wordCount / this.MAX_WORDS_PER_MINUTE);

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      wordCount,
      characterCount,
      readingTime
    };
  }

  /**
   * Extract key information from document for AI processing
   */
  static extractKeyInfo(content: DocumentContent): string {
    const { text, metadata } = content;
    
    // Extract first few sentences for context
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const preview = sentences.slice(0, 3).join('. ') + '.';
    
    return `Document: ${metadata.fileName}
Type: ${metadata.fileType}
Size: ${(metadata.fileSize / 1024).toFixed(1)}KB
Words: ${metadata.wordCount}
Reading time: ${metadata.readingTime} minutes

Preview: ${preview}

Content:
${text}`;
  }
} 