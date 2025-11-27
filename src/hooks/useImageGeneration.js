import { useState, useCallback } from "react";
import { compositeImage } from "../utils/canvasUtils";
import { uploadImage, pollJobStatus } from "../services/api";
import { ImageURLManager } from "../utils/imageUtils";

/**
 * 이미지 생성 및 처리 관리를 위한 커스텀 훅
 * @returns {Object} 이미지 생성 관련 상태 및 핸들러
 */
export const useImageGeneration = () => {
  const [processingStatus, setProcessingStatus] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const imageURLManager = new ImageURLManager();

  /**
   * 이미지 생성 및 서버 전송
   */
  const generateAndUpload = useCallback(
    async (uploadedFile, lights) => {
      if (!uploadedFile || lights.length === 0) {
        throw new Error("이미지와 조명을 모두 선택해주세요.");
      }

      try {
        // 방 이미지 로드
        const roomImageUrl = URL.createObjectURL(uploadedFile);
        const roomImage = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = roomImageUrl;
        });

        // 이미지 합성
        const blob = await compositeImage(roomImage, lights);

        // 서버에 업로드
        const { job_id, message } = await uploadImage(blob);

        // URL 정리
        URL.revokeObjectURL(roomImageUrl);

        return { job_id, message };
      } catch (error) {
        console.error("이미지 생성 오류:", error);
        throw error;
      }
    },
    []
  );

  /**
   * 작업 상태 폴링 시작
   */
  const startJobPolling = useCallback((jobId) => {
    setCurrentJobId(jobId);
    setProcessingStatus({ status: "pending", progress: 0, message: "작업이 대기 중입니다." });

    pollJobStatus(
      jobId,
      (status) => {
        setProcessingStatus(status);
        console.log(`작업 상태 [${status.status}]: ${status.message || ""} (${status.progress || 0}%)`);
      },
      (status) => {
        setProcessingStatus(null);
        setCurrentJobId(null);
        return status;
      },
      (error) => {
        setProcessingStatus(null);
        setCurrentJobId(null);
        throw error;
      }
    );
  }, []);

  /**
   * 처리 상태 초기화
   */
  const resetProcessingStatus = useCallback(() => {
    setProcessingStatus(null);
    setCurrentJobId(null);
  }, []);

  return {
    processingStatus,
    currentJobId,
    generateAndUpload,
    startJobPolling,
    resetProcessingStatus,
  };
};

