import { API_BASE_URL, POLLING_INTERVAL, MAX_POLLING_ATTEMPTS } from "../constants/defaultValues";

/**
 * 합성된 이미지를 FastAPI 서버로 업로드하여 새로운 생성 작업을 시작합니다.
 *
 * @param {Blob} imageBlob - 서버로 전송할 PNG/JPEG Blob
 * @returns {Promise<{job_id: string, message: string}>} - 생성된 작업 ID와 서버측 안내 메시지
 * @throws {Error} - 네트워크 오류 또는 2xx 가 아닌 상태 코드가 반환된 경우
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
 * 단일 작업 ID 에 대한 현재 상태를 즉시 한 번 조회합니다.
 *
 * @param {string} jobId - 조회할 작업 ID
 * @returns {Promise<Object>} - 서버가 반환한 job_status 객체
 * @throws {Error} - 404(존재하지 않는 작업) 또는 기타 네트워크 오류 발생 시
 */
export const getJobStatus = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);

  if (!response.ok) {
    throw new Error("상태 조회 실패");
  }

  return response.json();
};

/**
 * 주어진 jobId 의 상태를 주기적으로 조회하면서, 콜백을 통해 진행 상황을 알리는 헬퍼입니다.
 *
 * @param {string} jobId - 폴링할 작업 ID
 * @param {(status: Object) => void} onStatusUpdate - 매 폴링마다 서버에서 받은 status 를 전달
 * @param {(status: Object) => void} onComplete - status.status === "completed" 인 시점에 한 번 호출
 * @param {(error: Error) => void} onError - 실패/타임아웃/예외 발생 시 호출
 *
 * MAX_POLLING_ATTEMPTS 를 초과하면 onError 가 "처리 시간이 초과되었습니다." 메시지와 함께 호출됩니다.
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
