import { useState, useCallback, useEffect } from "react";
import { compositeImage } from "../utils/canvasUtils";
import { uploadImage, pollJobStatus } from "../services/api";
import { API_BASE_URL } from "../constants/defaultValues";

/**
 * 이미지 생성 및 처리 관리를 위한 커스텀 훅
 * @returns {Object} 이미지 생성 관련 상태 및 핸들러
 */
export const useImageGeneration = () => {
  const [processingStatus, setProcessingStatus] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [compositedPreviewUrl, setCompositedPreviewUrl] = useState(null);
  const [generatedViewSize, setGeneratedViewSize] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [resultImagesByColor, setResultImagesByColor] = useState(null);
  const [generationMessage, setGenerationMessage] = useState(null);
  const [generationMessageType, setGenerationMessageType] = useState(null); // "info" | "success" | "error"
  const [history, setHistory] = useState([]);

  const HISTORY_STORAGE_KEY = "lumiply:history";

  /**
   * 이미지 생성 및 서버 전송
   * - 합성 결과는 항상 업로드한 원본 이미지와 동일한 해상도로 생성
   */
  const generateAndUpload = useCallback(
    async (uploadedFile, lights, displaySize) => {
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
        const blob = await compositeImage(roomImage, lights, displaySize);

        // 결과 비교 화면에서 참고용으로 원본 해상도 저장
        setGeneratedViewSize({ width: roomImage.width, height: roomImage.height });

        // 클라이언트에서 합성된 미리보기 URL 생성
        if (compositedPreviewUrl) {
          URL.revokeObjectURL(compositedPreviewUrl);
        }
        const previewUrl = URL.createObjectURL(blob);
        setCompositedPreviewUrl(previewUrl);

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
    [compositedPreviewUrl]
  );

  /**
   * 작업 상태 폴링 시작
   */
  const startJobPolling = useCallback((jobId) => {
    setCurrentJobId(jobId);
    setProcessingStatus({ status: "pending", progress: 0, message: "작업이 대기 중입니다." });
    setGenerationMessage("이미지 생성 작업을 시작했습니다.");
    setGenerationMessageType("info");

    pollJobStatus(
      jobId,
      (status) => {
        setProcessingStatus(status);
        if (status?.message) {
          setGenerationMessage(status.message);
          setGenerationMessageType("info");
        }
        console.log(`작업 상태 [${status.status}]: ${status.message || ""} (${status.progress || 0}%)`);
      },
      (status) => {
        setProcessingStatus(null);
        setCurrentJobId(null);
        // 완료 시 결과 이미지 URL 저장
        const result = status?.result || {};
        const colorImages = result.images;
        let primaryUrl = null;
        let primaryColorKey = "white";

        if (colorImages && typeof colorImages === "object") {
          // 색상별 이미지가 온 경우: 각 URL 을 절대 경로로 변환
          const mapped = {};
          Object.entries(colorImages).forEach(([key, url]) => {
            if (!url) return;
            const strUrl = String(url);
            const abs =
              strUrl.startsWith("http://") || strUrl.startsWith("https://")
                ? strUrl
                : `${API_BASE_URL}${strUrl}`;
            mapped[key] = abs;
          });
          setResultImagesByColor(Object.keys(mapped).length > 0 ? mapped : null);

          if (mapped.white) {
            primaryColorKey = "white";
            primaryUrl = mapped.white;
          } else {
            const keys = Object.keys(mapped);
            const firstKey = keys[0];
            if (firstKey) {
              primaryColorKey = firstKey;
              primaryUrl = mapped[firstKey];
            } else {
              primaryUrl = null;
            }
          }
        } else {
          // 구버전: 단일 image_url 필드 사용
          const imageUrl = result.image_url;
          if (imageUrl) {
            const abs =
              imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
                ? imageUrl
                : `${API_BASE_URL}${imageUrl}`;
            primaryUrl = abs;
            primaryColorKey = "white";
          }
        }

        if (primaryUrl) {
          setResultImageUrl(primaryUrl);
        } else {
          setResultImageUrl(null);
        }
        // 히스토리에 추가 (가장 최신 항목이 위로 오도록)
        setHistory((prev) => [
          {
            id: jobId,
            createdAt: Date.now(),
            previewUrl: compositedPreviewUrl,
            resultUrl: primaryUrl,
            colorKey: primaryColorKey,
            viewSize: generatedViewSize,
            message: status?.message || "이미지 생성이 완료되었습니다.",
          },
          ...prev,
        ]);
        setGenerationMessage(status?.message || "이미지 생성이 완료되었습니다.");
        setGenerationMessageType("success");
        return status;
      },
      (error) => {
        setProcessingStatus(null);
        setCurrentJobId(null);
        setGenerationMessage(error.message || "이미지 생성 중 오류가 발생했습니다.");
        setGenerationMessageType("error");
        throw error;
      }
    );
  }, [compositedPreviewUrl, generatedViewSize]);

  /**
   * 처리 상태 초기화
   */
  const resetProcessingStatus = useCallback(() => {
    setProcessingStatus(null);
    setCurrentJobId(null);
    if (compositedPreviewUrl) {
      URL.revokeObjectURL(compositedPreviewUrl);
    }
    setCompositedPreviewUrl(null);
    setGeneratedViewSize(null);
    setResultImageUrl(null);
    setResultImagesByColor(null);
    setGenerationMessage(null);
    setGenerationMessageType(null);
  }, [compositedPreviewUrl]);

  /**
   * 선택한 색상에 따라 현재 표시할 결과 이미지를 변경
   * - resultImagesByColor 에 해당 색상이 존재할 때만 반영
   */
  const setActiveResultColor = useCallback(
    (colorKey) => {
      if (!resultImagesByColor) return;
      const nextUrl = resultImagesByColor[colorKey];
      if (nextUrl) {
        setResultImageUrl(nextUrl);
      }
    },
    [resultImagesByColor]
  );

  // 초기 로드 시 localStorage 에서 히스토리 복원
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // 저장된 데이터에는 previewUrl 이 없을 수 있음
        setHistory(
          parsed.map((entry) => ({
            id: entry.id,
            createdAt: entry.createdAt,
            previewUrl: entry.previewUrl || null,
            resultUrl: entry.resultUrl || null,
            colorKey: entry.colorKey || "white",
            viewSize: entry.viewSize || null,
            message: entry.message || "",
          }))
        );
      }
    } catch (e) {
      console.error("히스토리 캐시 로드 실패:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 히스토리가 바뀔 때마다 localStorage 에 저장 (직렬화 가능한 필드만)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const serializable = history.map((entry) => ({
        id: entry.id,
        createdAt: entry.createdAt,
        colorKey: entry.colorKey || "white",
        resultUrl: entry.resultUrl,
        viewSize: entry.viewSize,
        message: entry.message,
      }));
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.error("히스토리 캐시 저장 실패:", e);
    }
  }, [history, HISTORY_STORAGE_KEY]);

  const isProcessing =
    !!processingStatus && (processingStatus.status === "pending" || processingStatus.status === "processing");

  return {
    processingStatus,
    currentJobId,
    compositedPreviewUrl,
    generatedViewSize,
    resultImageUrl,
    resultImagesByColor,
    generationMessage,
    generationMessageType,
    isProcessing,
    generateAndUpload,
    startJobPolling,
    resetProcessingStatus,
    history,
    setActiveResultColor,
  };
};

