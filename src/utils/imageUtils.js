import { API_BASE_URL } from "../constants/defaultValues";

/**
 * 외부 이미지 URL을 백엔드 프록시(/api/download_image) 경유로 변환 (이미 프록시형이면 그대로 반환)
 */
export function proxiedImageUrl(url) {
  if (!url) return url;
  try {
    // 브라우저 로컬 객체 URL/데이터 URL은 백엔드 프록시로 보낼 수 없음
    if (url.startsWith("blob:") || url.startsWith("data:")) return url;
    // 이미 프록시 경유일 때는 중첩 변환하지 않음
    if (url.includes("/api/download_image?path=")) return url;
    // 본문이 원본 URI라면 encode 후 사용
    return `${API_BASE_URL}/api/download_image?path=${encodeURIComponent(url)}`;
  } catch (_) {
    return url;
  }
}

export const isValidImageFile = (file) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return validTypes.includes(file.type);
};

export class ImageURLManager {
  constructor() {
    this.urls = new Set();
  }

  create(blob) {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  revoke(url) {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  revokeAll() {
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}
