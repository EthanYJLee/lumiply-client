import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

/**
 * 이미지 업로드를 위한 커스텀 훅
 * @param {File|null} uploadedFile - 현재 업로드된 파일
 * @param {Function} onFileSelect - 파일 선택 콜백
 * @returns {Object} dropzone props 및 핸들러
 */
export const useImageUpload = (uploadedFile, onFileSelect) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (onFileSelect) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
    },
    multiple: false,
    noClick: !!uploadedFile,
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
  };
};

