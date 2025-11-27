/**
 * 이미지 파일을 검증하는 함수
 * @param {File} file - 검증할 파일
 * @returns {boolean} 유효한 이미지 파일인지 여부
 */
export const isValidImageFile = (file) => {
  if (!file) return false;

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  return validTypes.includes(file.type);
};

/**
 * 이미지 URL을 생성하고 정리하는 유틸리티
 */
export class ImageURLManager {
  constructor() {
    this.urls = new Set();
  }

  /**
   * Blob에서 URL 생성
   * @param {Blob} blob - Blob 객체
   * @returns {string} 생성된 URL
   */
  create(blob) {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  /**
   * URL 정리
   * @param {string} url - 정리할 URL
   */
  revoke(url) {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  /**
   * 모든 URL 정리
   */
  revokeAll() {
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}
