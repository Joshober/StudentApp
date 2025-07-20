"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Send,
  Shield,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentReader, DocumentContent } from '@/lib/document-reader';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: DocumentContent;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  progress: number;
}

interface FileUploadAreaProps {
  onFilesReady: (files: UploadedFile[]) => void;
  onSendToAI: (files: UploadedFile[]) => void;
  onRemoveFile?: (fileId: string) => void;
  disabled?: boolean;
  uploadedFiles?: UploadedFile[];
}

const ALLOWED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/csv',
  'application/json',
  'text/html'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFilesReady,
  onSendToAI,
  onRemoveFile,
  disabled = false,
  uploadedFiles: externalUploadedFiles
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use external files if provided, otherwise use internal state
  const displayFiles = externalUploadedFiles || uploadedFiles;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const file of acceptedFiles) {
      await processFile(file);
    }

    // Close dialog after processing
    setIsDialogOpen(false);
  }, [uploadedFiles]);

  const processFile = async (file: File) => {
    console.log('Processing file:', file.name, file.type, file.size);
    const fileId = Math.random().toString(36).substr(2, 9);
    
    setUploadedFiles(prev => 
      prev.map(f => 
        f.name === file.name 
          ? { ...f, id: fileId, status: 'processing' as const }
          : f
      )
    );

    try {
      // Validate file
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`File type ${file.type} not supported`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit`);
      }

      console.log('File validation passed, processing with DocumentReader...');

      // Process file with DocumentReader
      const documentContent = await processFileWithDocumentReader(file);

      console.log('Document processed successfully:', documentContent);

      setUploadedFiles(prev => {
        const updated = prev.map(f => 
          f.name === file.name 
            ? { 
                ...f, 
                content: documentContent, 
                status: 'ready' as const,
                progress: 100
              }
            : f
        );
        
        // Notify parent component of ready files
        const readyFiles = updated.filter(f => f.status === 'ready');
        console.log('Ready files:', readyFiles);
        if (readyFiles.length > 0) {
          onFilesReady(readyFiles);
        }
        
        return updated;
      });

      } catch (error) {
      console.error('Error processing file:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { 
                ...f, 
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : f
        )
      );
      }
  };

  const processFileWithDocumentReader = async (file: File): Promise<DocumentContent> => {
    try {
      return await DocumentReader.readDocument(file);
    } catch (error) {
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onRemoveFile?.(fileId);
  };

  const handleSendToAI = () => {
    const readyFiles = uploadedFiles.filter(f => f.status === 'ready');
    if (readyFiles.length > 0) {
      onSendToAI(readyFiles);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/html': ['.html', '.htm']
    },
    maxSize: MAX_FILE_SIZE,
    disabled
  });

  const readyFiles = uploadedFiles.filter(f => f.status === 'ready');
  const hasErrors = uploadedFiles.some(f => f.status === 'error');

  return (
    <div className="space-y-2">
      {/* Compact Upload Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full border-dashed hover:border-solid bg-white/90 backdrop-blur-sm"
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              Upload Documents
            </DialogTitle>
          </DialogHeader>
          
          {/* Drop Zone in Dialog */}
          <div className="space-y-4">
      <div
        {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
      >
        <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                {isDragActive 
                  ? 'Drop files here...' 
                  : '📎 Upload documents to analyze with AI'
                }
          </p>
              <p className="text-xs text-gray-500">
                Documents: PDF, DOC, DOCX • Text: TXT, MD, CSV, JSON, HTML (max 10MB each)
          </p>
      </div>

            {/* Security Notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-700">
                Files are processed securely. Scripts and dangerous content are automatically removed.
              </AlertDescription>
            </Alert>
        </div>
        </DialogContent>
      </Dialog>

      {/* File Status Badge - Only show if files exist */}
      {displayFiles.length > 0 && (
        <div className="flex items-center gap-1">
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 ${
              displayFiles.some(f => f.status === 'processing' || f.status === 'uploading')
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {displayFiles.filter(f => f.status === 'ready').length}/{displayFiles.length}
            {displayFiles.some(f => f.status === 'processing' || f.status === 'uploading') && ' (processing)'}
          </Badge>
        </div>
      )}
    </div>
  );
};