// 기본값 상수
export const DEFAULT_COLOR_TEMPERATURE = "#ffffff";
export const DEFAULT_LIGHT_INTENSITY = 50;
export const DEFAULT_LIGHT_SCALE = 1.0;
export const DEFAULT_LIGHT_SIZE = 100;

// 드래그 설정
export const DRAG_THRESHOLD = 5; // 5px 이상 이동해야 드래그로 인식

// 스케일 제한
export const MIN_SCALE = 0.3;
export const MAX_SCALE = 3.0;

// 작업 상태 폴링 설정
export const POLLING_INTERVAL = 5000; // 5초
export const MAX_POLLING_ATTEMPTS = 120; // 최대 10분

// API 설정
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
