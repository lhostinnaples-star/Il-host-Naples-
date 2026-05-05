import React, { useCallback, useState } from 'react';
import { X, Loader2, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

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
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File ${file.name} is too large. Max 5MB.`);
      throw new Error('File too large');
    }

    return new Promise<string>((resolve, reject) => {
      console.log(`[MOCK] Preparing for Firebase Storage: ${storagePath}/${Date.now()}_${file.name}`);
      setIsUploading(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Auto convert to WebP if possible using canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const webpData = canvas.toDataURL('image/webp', 0.8);
            
            let progress = 0;
            const interval = setInterval(() => {
              progress += 20;
              setUploadProgress(progress);
              if (progress >= 100) {
                clearInterval(interval);
                console.log("Image ready for Firebase Storage");
                resolve(webpData);
              }
            }, 100);
          } else {
            resolve(result); // Fallback to original Base64 if canvas fails
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
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
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#334155] bg-[#0f172a] px-6 py-12 md:py-16 text-center transition-all hover:border-[#F5A623]/50 hover:bg-[#1e293b]"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-[#F5A623] mb-4" />
              <p className="font-black text-white uppercase tracking-widest text-[10px]">Uploading... {Math.min(uploadProgress, 100)}%</p>
              <div className="w-48 h-1 bg-[#334155] rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-[#F5A623]"
                />
              </div>
            </div>
          ) : (
            <>
              <ArrowUpCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-[#334155] group-hover:text-[#F5A623] transition-colors" />
              <p className="font-black text-white uppercase tracking-widest text-[10px]">Upload from Phone or Computer</p>
              <p className="text-[10px] font-bold text-[#64748b] mt-2 group-hover:text-[#94a3b8]">Tap to browse or drag and drop images (Max 5MB)</p>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple={maxImages > 1}
            onChange={handleFileInput}
            disabled={isUploading}
          />
        </label>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          {images.map((img, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl border border-[#334155] bg-[#0f172a]">
              <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors flex flex-col items-center justify-center gap-1">
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-[#F5A623] text-black text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest shadow-lg">Main</span>
                )}
                <div className="bg-black/40 backdrop-blur-md border border-white/5 px-2 py-1 rounded-lg flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[7px] font-black uppercase text-white/90 tracking-widest">Pending Sync</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-red-500 group-hover:opacity-100"
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
