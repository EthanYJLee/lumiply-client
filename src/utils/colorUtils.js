/**
 * Hex 색상을 RGB로 변환하는 헬퍼 함수
 * @param {string} hex - Hex 색상 코드 (#ffffff 또는 ffffff)
 * @returns {{r: number, g: number, b: number}} RGB 객체
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
};
