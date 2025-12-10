import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

/**
 * 초기 업로드 화면에서 drag & drop / 클릭 업로드를 처리하는 훅입니다.
 *
 * @param {File|null} uploadedFile - 이미 업로드된 파일이 있는 경우, dropzone 클릭을 비활성화하기 위해 사용
 * @param {(file: File) => void} onFileSelect - 유효한 이미지 파일이 선택되었을 때 호출되는 콜백
 * @returns {{ getRootProps: Function, getInputProps: Function, isDragActive: boolean }} - dropzone 에 바로 전달할 prop 집합
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
