import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Camera, 
  Video, 
  Image, 
  X, 
  File, 
  Download,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  localUrl: string; // For client-side preview
  supabaseUrl?: string; // URL after upload to Supabase
  rawFile?: File; // The actual file object for new uploads
  uploadedAt: Date;
}

interface InternalNotesSectionProps {
  notes: string;
  files: UploadedFile[];
  onNotesChange: (notes: string) => void;
  onFilesChange: (files: UploadedFile[]) => void;
}

const InternalNotesSection: React.FC<InternalNotesSectionProps> = ({
  notes,
  files,
  onNotesChange,
  onFilesChange
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for files
  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return File;
  };

  // Handle file processing
  const processFiles = useCallback(async (fileList: FileList) => {
    setUploading(true);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
        continue;
      }

      // Create object URL for local preview
      const localUrl = URL.createObjectURL(file);
      
      const uploadedFile: UploadedFile = {
        id: generateFileId(),
        name: file.name,
        size: file.size,
        type: file.type,
        localUrl,
        rawFile: file, // Store the actual file for upload
        uploadedAt: new Date()
      };

      newFiles.push(uploadedFile);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
    
    setUploading(false);
  }, [files, onFilesChange]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  // Remove file
  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    // Revoke local object URL to free memory
    const fileToRemove = files.find(file => file.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.localUrl);
    }
    onFilesChange(updatedFiles);
  };

  // Check if device supports camera
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-6 flex items-center">
        <FileText className="h-6 w-6 text-forest mr-2" />
        Internal Notes & Files
      </h2>

      <div className="space-y-6">
        {/* Notes Section */}
        <div>
          <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
            Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter resize-none"
            placeholder="Add internal notes for your team about this job (client preferences, special instructions, equipment needed, etc.)"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1 font-inter">
            These notes are only visible to your team and will not be shared with the client.
          </p>
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-inter font-medium text-dark-slate mb-3">
            Attachments
          </label>
          
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-forest bg-forest/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              
              <div>
                <p className="text-gray-600 font-inter mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500 font-inter">
                  Supports images, videos, documents (max 50MB per file)
                </p>
              </div>

              {/* Upload Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                {/* General File Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-inter font-semibold text-sm flex items-center"
                >
                  <File className="mr-2 h-4 w-4" />
                  Choose Files
                </button>

                {/* Camera Capture (Mobile) */}
                {isMobileDevice() && (
                  <>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-inter font-semibold text-sm flex items-center"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors font-inter font-semibold text-sm flex items-center"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Record Video
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {/* Camera Input (Mobile) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {/* Video Input (Mobile) */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Uploading State */}
          {uploading && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-inter text-sm">Processing files...</span>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-inter font-semibold text-dark-slate">
                Attached Files ({files.length})
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  const isImage = file.type.startsWith('image/');
                  const isVideo = file.type.startsWith('video/');
                  
                  return (
                    <div key={file.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {isImage ? (
                            <img
                              src={file.supabaseUrl || file.localUrl}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                            />
                          ) : isVideo ? (
                            <video
                              src={file.supabaseUrl || file.localUrl}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                              muted
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FileIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-inter font-medium text-dark-slate truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(file.size)} • {file.uploadedAt.toLocaleTimeString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          {(isImage || isVideo) && (
                            <button
                              type="button"
                              onClick={() => window.open(file.supabaseUrl || file.localUrl, '_blank')}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.supabaseUrl || file.localUrl;
                              link.download = file.name;
                              link.click();
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-100 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalNotesSection;