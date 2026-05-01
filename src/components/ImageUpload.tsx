import React, { useCallback, useState } from 'react';
import { X, Loader2, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  maxImages?: number;
  onImagesChange: (images: string[]) => void;
  storagePath: string; // e.g. properties/ownerId
  initialImages?: string[];
}

export function ImageUpload({ maxImages = 5, onImagesChange, storagePath, initialImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Ready for Firebase integration
  const uploadToFirebase = async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      // MOCK UPLOAD
      console.log(`[MOCK] Uploading to Firebase Storage at path: ${storagePath}/${Date.now()}_${file.name}`);
      setIsUploading(true);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          
          // Read as Base64 for preview instead of real upload URL
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
      }, 100); // Simulate upload speed
    }).finally(() => {
      setIsUploading(false);
      setUploadProgress(0);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
  }, [images, maxImages]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    let allowedFiles = files;
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images.`);
      allowedFiles = files.slice(0, maxImages - images.length);
    }

    if (allowedFiles.length === 0) return;

    try {
      const uploadedUrls = await Promise.all(allowedFiles.map(f => uploadToFirebase(f)));
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {images.length < maxImages && (
        <label
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 md:py-16 text-center transition-all hover:border-[#fbbf24] hover:bg-amber-50/50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-amber-500 mb-4" />
              <p className="font-bold text-[#1e293b] text-sm md:text-base">Uploading... {Math.min(uploadProgress, 100)}%</p>
            </div>
          ) : (
            <>
              <ArrowUpCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-neutral-300 group-hover:text-[#fbbf24] transition-colors" />
              <p className="font-bold text-[#1e293b] text-sm md:text-base">Upload from Phone or Computer</p>
              <p className="text-xs md:text-sm text-neutral-400">Tap to browse or drag and drop images (Max 5MB)</p>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            disabled={isUploading}
          />
        </label>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          {images.map((img, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl border border-neutral-100">
              <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
