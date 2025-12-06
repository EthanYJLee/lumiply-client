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
 * @param {number} canvasWidth - Canvas 너비 (원본 이미지 너비)
 * @param {number} canvasHeight - Canvas 높이 (원본 이미지 높이)
 * @param {number} scaleX - 표시된 이미지 대비 원본 이미지의 가로 스케일 비율
 * @param {number} scaleY - 표시된 이미지 대비 원본 이미지의 세로 스케일 비율
 */
export const drawLightOnCanvas = (ctx, lightImage, light, canvasWidth, canvasHeight, scaleX = 1, scaleY = 1) => {
  const lightX = (light.position.x / 100) * canvasWidth;
  const lightY = (light.position.y / 100) * canvasHeight;
  const baseSize = DEFAULT_LIGHT_SIZE * (light.scale || 1.0);
  // 세로로 긴 이미지에서 scaleX, scaleY 가 달라지면 조명이 가로/세로로 찌그러질 수 있으므로
  // 하나의 균일 스케일 팩터를 사용해서 비율을 유지한다.
  //
  // 에디터에서는 조명 크기가 "이미지 너비 대비" 비율로 느껴지므로,
  // 원본 해상도에서도 이미지 너비 기준 스케일(scaleX)을 그대로 사용하는 것이 가장 자연스럽다.
  // (object-fit: contain 으로 표시되면 실제로는 width/height 비율이 동일하므로 scaleX ≈ scaleY)
  const uniformScale = scaleX || scaleY || 1;
  const lightWidth = baseSize * uniformScale;
  const lightHeight = baseSize * uniformScale;

  ctx.save();

  const intensity = light.intensity || 50;

  // 조명 이미지를 원본 그대로(투명 배경 유지) 선명하게 그리기
  // PNG 내부에 이미 광량/형태 정보가 들어있기 때문에 별도의 투명도/오버레이 처리를 하지 않는다.
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1.0;
  ctx.filter = `brightness(${1 + intensity / 200})`;
  ctx.drawImage(lightImage, lightX - lightWidth / 2, lightY - lightHeight / 2, lightWidth, lightHeight);

  ctx.restore();
};

/**
 * Canvas에 방 이미지와 조명들을 합성하는 함수
 * @param {HTMLImageElement} roomImage - 방 이미지
 * @param {Array} lights - 조명 배열
 * @param {{ width: number, height: number } | undefined} displaySize - 화면에 표시된 이미지 크기
 * @returns {Promise<Blob>} 합성된 이미지 Blob (원본 이미지와 동일한 해상도)
 */
export const compositeImage = async (roomImage, lights, displaySize) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = roomImage.width;
  const height = roomImage.height;

  canvas.width = width;
  canvas.height = height;

  // 방 이미지 그리기 (원본 해상도)
  ctx.drawImage(roomImage, 0, 0, width, height);

  // 화면에 표시된 이미지(실제 그려진 영역)의 크기와 원본 해상도의 비율 계산
  // App 쪽에서 object-fit: contain 결과인 "drawnW/drawnH" 를 displaySize 로 넘겨주므로
  // 여기서는 단순히 원본 → 화면 비율의 역수만 사용하면 된다.
  let scaleX = 1;
  let scaleY = 1;

  if (displaySize?.width) {
    scaleX = width / displaySize.width;
  }
  if (displaySize?.height) {
    scaleY = height / displaySize.height;
  }

  // 각 조명 이미지 로드 및 그리기
  for (const light of lights) {
    const lightImage = await loadImage(light.lightPath);
    drawLightOnCanvas(ctx, lightImage, light, canvas.width, canvas.height, scaleX, scaleY);
  }

  // Canvas를 Blob으로 변환
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("이미지 생성에 실패했습니다."));
        return;
      }
      resolve(blob);
    }, "image/png");
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
