import { useCallback, useState } from 'react';
import { UploadSimple, File } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileName(file.name);
      onFileLoad(content);
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ndjson,.json,.jsonl';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
        isDragging 
          ? "border-primary bg-primary/10" 
          : "border-border hover:border-primary/50 hover:bg-card/50"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
          isDragging ? "bg-primary/20" : "bg-secondary"
        )}>
          {fileName ? (
            <File className="w-8 h-8 text-accent" weight="duotone" />
          ) : (
            <UploadSimple className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} weight="duotone" />
          )}
        </div>
        
        {fileName ? (
          <div>
            <p className="text-lg font-medium text-foreground">{fileName}</p>
            <p className="text-sm text-muted-foreground mt-1">Click or drop to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-foreground">
              Drop your NDJSON file here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse • Supports .ndjson, .json, .jsonl
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
