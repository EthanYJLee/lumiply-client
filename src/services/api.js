import { API_BASE_URL, POLLING_INTERVAL, MAX_POLLING_ATTEMPTS } from "../constants/defaultValues";

/**
 * 이미지를 서버에 업로드하고 작업을 시작
 * @param {Blob} imageBlob - 업로드할 이미지 Blob
 * @returns {Promise<{job_id: string, message: string}>}
 */
export const uploadImage = async (imageBlob) => {
  const formData = new FormData();
  formData.append("image", imageBlob, "room_with_lights.png");

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`서버 오류: ${response.status}`);
  }

  return response.json();
};

/**
 * 작업 상태를 조회
 * @param {string} jobId - 작업 ID
 * @returns {Promise<Object>} 작업 상태 객체
 */
export const getJobStatus = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);

  if (!response.ok) {
    throw new Error("상태 조회 실패");
  }

  return response.json();
};

/**
 * 작업 상태를 폴링하는 함수
 * @param {string} jobId - 작업 ID
 * @param {Function} onStatusUpdate - 상태 업데이트 콜백
 * @param {Function} onComplete - 완료 콜백
 * @param {Function} onError - 에러 콜백
 */
export const pollJobStatus = (jobId, onStatusUpdate, onComplete, onError) => {
  let attempts = 0;

  const poll = async () => {
    try {
      const status = await getJobStatus(jobId);
      onStatusUpdate(status);

      if (status.status === "completed") {
        onComplete(status);
        return;
      }

      if (status.status === "failed") {
        onError(new Error(status.error || "알 수 없는 오류"));
        return;
      }

      if (status.status === "processing" || status.status === "pending") {
        attempts++;
        if (attempts < MAX_POLLING_ATTEMPTS) {
          setTimeout(poll, POLLING_INTERVAL);
        } else {
          onError(new Error("처리 시간이 초과되었습니다."));
        }
      }
    } catch (error) {
      onError(error);
    }
  };

  poll();
};
