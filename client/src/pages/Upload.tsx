import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setSuccess(false);
    const file = acceptedFiles[0];

    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      setError('Only .xlsx files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const jwt = localStorage.getItem('jwt'); // Get JWT from storage

      const response = await fetch(`${import.meta.env.VITE_SERVER}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <p className="text-gray-600">
            {isDragActive ? 'Drop the file here' : 'Drag and drop your .xlsx file, or click to select'}
          </p>
          
          <p className="text-sm text-gray-500">
            Only Excel files (.xlsx) are accepted
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4">
        {loading && (
          <div className="text-blue-500 text-sm">Uploading...</div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        
        {success && (
          <div className="text-green-500 text-sm mt-2">
            File uploaded successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;