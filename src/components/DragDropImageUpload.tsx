import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { ImageIcon, Upload, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface DragDropImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  onUseSample: () => void;
}

export function DragDropImageUpload({ onImageSelect, currentImage, onUseSample }: DragDropImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      toast.error("Please drop an image file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    
    // Convert to data URL since we can't actually upload files in this demo
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelect(result);
        toast.success("Image uploaded successfully!");
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error("Failed to process image");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    onImageSelect("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {currentImage ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <ImageWithFallback
                src={currentImage}
                alt="Menu item preview"
                className="w-32 h-32 object-cover rounded-lg border mx-auto"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Click or drag to replace image
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {isUploading ? (
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
              ) : (
                <Upload className={`w-12 h-12 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
            </div>
            <div className="space-y-2">
              <p className={`font-medium ${isDragOver ? 'text-primary' : 'text-foreground'}`}>
                {isUploading ? 'Uploading...' : 'Drop your image here'}
              </p>
              <p className="text-sm text-muted-foreground">
                Or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Options */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onUseSample}
          className="flex-1"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Use Sample Image
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Browse Files
        </Button>
      </div>
    </div>
  );
}