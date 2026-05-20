import { useCallback, useState } from 'react';
import { UploadSimple, File, CheckCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { detectFileType } from '@/lib/metrics';

interface FileUploadProps {
  onFileLoad: (content: string, fileType: 'user' | 'team') => void;
  hasUserData?: boolean;
  hasTeamData?: boolean;
}

export function FileUpload({ onFileLoad, hasUserData, hasTeamData }: FileUploadProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [fileNames, setFileNames] = useState<{ user?: string; team?: string }>({});

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Auto-detect file type
      const fileType = detectFileType(content);
      if (fileType === 'team') {
        setFileNames(prev => ({ ...prev, team: file.name }));
        onFileLoad(content, 'team');
      } else if (fileType === 'user') {
        setFileNames(prev => ({ ...prev, user: file.name }));
        onFileLoad(content, 'user');
      } else {
        // Default to user type for backward compatibility
        setFileNames(prev => ({ ...prev, user: file.name }));
        onFileLoad(content, 'user');
      }
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Support multiple files
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      handleFile(file);
    }
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
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        for (const file of Array.from(files)) {
          handleFile(file);
        }
      }
    };
    input.click();
  }, [handleFile]);

  const hasAnyFile = fileNames.user || fileNames.team || hasUserData || hasTeamData;

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
          {hasAnyFile ? (
            <File className="w-8 h-8 text-accent" weight="duotone" />
          ) : (
            <UploadSimple className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} weight="duotone" />
          )}
        </div>
        
        {hasAnyFile ? (
          <div className="space-y-2">
            {(fileNames.user || hasUserData) && (
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                <span className="text-sm text-foreground">{fileNames.user || t('upload.file_detected_user')}</span>
                <span className="text-xs text-muted-foreground">(Per-User)</span>
              </div>
            )}
            {(fileNames.team || hasTeamData) && (
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                <span className="text-sm text-foreground">{fileNames.team || t('upload.file_detected_team')}</span>
                <span className="text-xs text-muted-foreground">(User-Teams)</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">Click or drop to add more files</p>
            {!fileNames.team && !hasTeamData && (fileNames.user || hasUserData) && (
              <p className="text-xs text-muted-foreground/70">{t('teams.upload_hint')}</p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-foreground">
              {t('upload.drop_multi')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('upload.formats')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
