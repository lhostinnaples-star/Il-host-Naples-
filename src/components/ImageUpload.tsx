import React, { useCallback, useState } from 'react';
import { X, Loader2, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { storage } from '../config/firebase';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';

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
  const [stats, setStats] = useState<Array<{ before: string; after: string }>>([]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const maxWidth = 1200;
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85));
        URL.revokeObjectURL(url);
      };
      img.src = url;
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

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const newImages = [...images];
      const newStats = [...stats];

      for (let i = 0; i < allowedFiles.length; i++) {
        const file = allowedFiles[i];
        const originalSize = file.size;

        const webpData = await compressImage(file);
        let finalUrl = webpData;
        
        try {
          const blob = await fetch(webpData).then(res => res.blob());
          const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '') || 'image.webp'}`;
          const fullPath = `${storagePath}/${filename}`;
          
          finalUrl = await new Promise((resolve, reject) => {
            const storageRef = ref(storage, fullPath);
            const uploadTask = uploadBytesResumable(storageRef, blob);
            
            uploadTask.on('state_changed',
              (snapshot) => {
                const stepProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                const baseProgress = (i / allowedFiles.length) * 90;
                const currentFileProgress = (stepProgress / 100) * (90 / allowedFiles.length);
                setUploadProgress(10 + Math.round(baseProgress + currentFileProgress));
              },
              (error) => reject(error),
              async () => {
                try {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(url);
                } catch (e) {
                  reject(e);
                }
              }
            );
          });
        } catch (e) {
          console.warn('Firebase Storage upload failed, falling back to Base64', e);
          toast.warning('Storage upload failed, using local fallback.');
        }

        // Approximate base64 size
        const compressedSize = Math.round((webpData.length - 'data:image/webp;base64,'.length) * 3 / 4);
        
        newImages.push(finalUrl);
        newStats.push({ 
          before: formatSize(originalSize), 
          after: formatSize(compressedSize) 
        });

        setUploadProgress(10 + Math.round(((i + 1) / allowedFiles.length) * 90));
      }

      setUploadProgress(100);
      setImages(newImages);
      setStats(newStats);
      onImagesChange(newImages);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000); // Wait 1s to show "Upload complete!"
    } catch (error) {
      toast.error('Failed to process image. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newStats = stats.filter((_, i) => i !== index);
    setImages(newImages);
    setStats(newStats);
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
            <div className="flex flex-col items-center w-full max-w-xs mx-auto">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-[#F5A623] mb-4" />
              <p className="font-black text-white uppercase tracking-widest text-[10px]">{uploadProgress >= 100 ? 'Upload complete!' : `Uploading... ${uploadProgress}%`}</p>
              <div className="w-full h-1 bg-[#334155] rounded-full mt-4 overflow-hidden">
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
              <p className="text-[10px] font-bold text-[#64748b] mt-2 group-hover:text-[#94a3b8]">Tap to browse or drag and drop images (No size limit)</p>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple={maxImages > 1}
            onChange={handleFileInput}
            disabled={isUploading}
          />
        </label>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          {images.map((img, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl border border-[#334155] bg-[#0f172a]">
              <div className="aspect-square relative flex">
                <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors flex flex-col items-center justify-center gap-1">
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-[#F5A623] text-black text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest shadow-lg">Main</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-red-500 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Show Stats if available (newly uploaded) */}
              {stats[idx] && (
                <div className="px-2 py-2 bg-[#1e293b] border-t border-[#334155]">
                  <p className="text-[9px] font-bold text-neutral-400 text-center flex flex-col gap-0.5">
                    <span className="line-through text-red-400/80">{stats[idx].before}</span>
                    <span className="text-[#F5A623]">{stats[idx].after} WebP</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
