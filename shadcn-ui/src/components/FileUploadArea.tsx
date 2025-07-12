import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/types';
import { storeFile } from '@/lib/file-helpers';
import { useStudySession } from '@/context/StudySessionContext';
import { X, Upload, File } from 'lucide-react';

export const FileUploadArea = () => {
  const { currentSession, addFileToCurrentSession, removeFileFromCurrentSession } = useStudySession();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    const totalFiles = acceptedFiles.length;
    let processedFiles = 0;

    for (const file of acceptedFiles) {
      try {
        // Process and store the file (in a real app, this would upload to a server)
        const fileUpload = await storeFile(file);
        
        // Add the file to the current session
        addFileToCurrentSession(fileUpload);
        
        // Update progress
        processedFiles++;
        setProgress(Math.round((processedFiles / totalFiles) * 100));
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setUploading(false);
  }, [addFileToCurrentSession]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-500" />
          <p className="text-sm text-gray-500">
            {isDragActive ? (
              'Drop the files here...'
            ) : (
              'Drag & drop files, or click to select files'
            )}
          </p>
          <p className="text-xs text-gray-400">
            Supports: TXT, PDF, DOC, DOCX, PNG, JPG
          </p>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">Uploading files: {progress}%</p>
        </div>
      )}

      {currentSession?.files && currentSession.files.length > 0 && (
        <div className="border rounded-md p-4 space-y-2">
          <h3 className="font-medium text-sm">Uploaded Files</h3>
          <ul className="space-y-2">
            {currentSession.files.map((file) => (
              <li key={file.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="truncate max-w-[180px]">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFileFromCurrentSession(file.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};