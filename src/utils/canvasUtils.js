import { hexToRgb } from "./colorUtils";
import { DEFAULT_LIGHT_SIZE, MIN_SCALE, MAX_SCALE } from "../constants/defaultValues";

/**
 * 이미지를 로드하는 Promise
 * @param {string} src - 이미지 소스 URL
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Canvas에 조명 이미지를 그리는 함수
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {HTMLImageElement} lightImage - 조명 이미지
 * @param {Object} light - 조명 객체
 * @param {number} canvasWidth - Canvas 너비
 * @param {number} canvasHeight - Canvas 높이
 */
export const drawLightOnCanvas = (ctx, lightImage, light, canvasWidth, canvasHeight) => {
  const lightX = (light.position.x / 100) * canvasWidth;
  const lightY = (light.position.y / 100) * canvasHeight;
  const lightSize = DEFAULT_LIGHT_SIZE * (light.scale || 1.0);
  const lightWidth = lightSize;
  const lightHeight = lightSize;

  ctx.save();

  const color = light.colorTemperature || "#ffffff";
  const rgb = hexToRgb(color);
  const intensity = light.intensity || 50;

  // 조명 이미지 그리기
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = intensity / 100;
  ctx.filter = `brightness(${1 + intensity / 200})`;
  ctx.drawImage(lightImage, lightX - lightWidth / 2, lightY - lightHeight / 2, lightWidth, lightHeight);

  // 색온도 오버레이 적용
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = intensity / 200;
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
  ctx.fillRect(lightX - lightWidth / 2, lightY - lightHeight / 2, lightWidth, lightHeight);

  ctx.restore();
};

/**
 * Canvas에 방 이미지와 조명들을 합성하는 함수
 * @param {HTMLImageElement} roomImage - 방 이미지
 * @param {Array} lights - 조명 배열
 * @returns {Promise<Blob>} 합성된 이미지 Blob
 */
export const compositeImage = async (roomImage, lights) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = roomImage.width;
  canvas.height = roomImage.height;

  // 방 이미지 그리기
  ctx.drawImage(roomImage, 0, 0);

  // 각 조명 이미지 로드 및 그리기
  for (const light of lights) {
    const lightImage = await loadImage(light.lightPath);
    drawLightOnCanvas(ctx, lightImage, light, canvas.width, canvas.height);
  }

  // Canvas를 Blob으로 변환
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지 생성에 실패했습니다."));
          return;
        }
        resolve(blob);
      },
      "image/png"
    );
  });
};

/**
 * 스케일 값을 제한하는 함수
 * @param {number} scale - 스케일 값
 * @returns {number} 제한된 스케일 값
 */
export const clampScale = (scale) => {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
};

