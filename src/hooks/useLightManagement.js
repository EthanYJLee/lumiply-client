import { useState, useCallback } from "react";
import {
  DEFAULT_COLOR_TEMPERATURE,
  DEFAULT_LIGHT_INTENSITY,
  DEFAULT_LIGHT_SCALE,
} from "../constants/defaultValues";

/**
 * 에디터 상에 배치된 조명들의 상태를 관리하는 훅입니다.
 *
 * - 조명 추가/제거/이동/스케일 변경
 * - 현재 선택된 조명 및 색온도/강도 슬라이더 값 동기화
 *
 * 리턴 객체는 Arrange 화면 전반에서 조명 상태를 단일 소스로 사용할 수 있도록 구성되어 있습니다.
 */
export const useLightManagement = () => {
  const [lights, setLights] = useState([]);
  const [selectedLightId, setSelectedLightId] = useState(null);
  const [colorTemperature, setColorTemperature] = useState(DEFAULT_COLOR_TEMPERATURE);
  const [lightIntensity, setLightIntensity] = useState(DEFAULT_LIGHT_INTENSITY);

  /**
   * 새 조명을 추가하고, 방금 추가한 조명을 선택 상태로 만듭니다.
   *
   * @param {string} lightPath - 조명 PNG 경로 (public 기준 상대 경로)
   * @param {{x: number, y: number}} [position={x:50,y:50}] - 이미지 컨테이너 기준 퍼센트 좌표
   * @returns {Object} 생성된 조명 객체
   */
  const addLight = useCallback((lightPath, position = { x: 50, y: 50 }) => {
    const newLight = {
      id: Date.now() + Math.random(),
      lightPath,
      position,
      colorTemperature: DEFAULT_COLOR_TEMPERATURE,
      intensity: DEFAULT_LIGHT_INTENSITY,
      scale: DEFAULT_LIGHT_SCALE,
    };

    setLights((prev) => [...prev, newLight]);
    setSelectedLightId(newLight.id);
    setColorTemperature(newLight.colorTemperature);
    setLightIntensity(newLight.intensity);

    return newLight;
  }, []);

  /**
   * 특정 조명을 목록에서 제거합니다.
   *
   * @param {number} lightId - 제거할 조명 ID
   * 선택된 조명을 제거한 경우, selection 도 함께 해제됩니다.
   */
  const removeLight = useCallback(
    (lightId) => {
      setLights((prev) => prev.filter((l) => l.id !== lightId));
      if (selectedLightId === lightId) {
        setSelectedLightId(null);
      }
    },
    [selectedLightId]
  );

  /**
   * 조명 위치를 업데이트합니다.
   *
   * @param {number} lightId - 대상 조명 ID
   * @param {{x: number, y: number}} position - 컨테이너 기준 퍼센트 좌표 (0~100)
   * 위치 값 자체의 범위 제한은 useDragAndDrop 쪽에서 이미 보장합니다.
   */
  const updateLightPosition = useCallback((lightId, position) => {
    // 위치는 useDragAndDrop에서 이미 제한되므로 그대로 사용
    setLights((prev) =>
      prev.map((light) => (light.id === lightId ? { ...light, position } : light))
    );
  }, []);

  /**
   * 조명 스케일(배율)을 업데이트합니다.
   *
   * @param {number} lightId - 대상 조명 ID
   * @param {number} scale - 0.3 ~ 3.0 범위의 배율 값
   */
  const updateLightScale = useCallback((lightId, scale) => {
    setLights((prev) =>
      prev.map((light) => (light.id === lightId ? { ...light, scale } : light))
    );
  }, []);

  /**
   * 현재 선택된 조명 객체에 일부 속성(색온도, 강도 등)을 일괄 반영합니다.
   *
   * @param {Object} updates - 덮어쓸 속성 값들 (예: { colorTemperature, intensity })
   * 선택된 조명이 없는 경우에는 아무 작업도 수행하지 않습니다.
   */
  const updateSelectedLightProperties = useCallback(
    (updates) => {
      if (selectedLightId) {
        setLights((prev) =>
          prev.map((light) =>
            light.id === selectedLightId ? { ...light, ...updates } : light
          )
        );
      }
    },
    [selectedLightId]
  );

  /**
   * 모든 조명을 제거하고, 선택/슬라이더 상태를 초기값으로 되돌립니다.
   * - 새 이미지를 업로드하거나, "초기화"에 가까운 동작을 수행할 때 사용합니다.
   */
  const resetLights = useCallback(() => {
    setLights([]);
    setSelectedLightId(null);
    setColorTemperature(DEFAULT_COLOR_TEMPERATURE);
    setLightIntensity(DEFAULT_LIGHT_INTENSITY);
  }, []);

  /**
   * 특정 조명을 선택 상태로 설정합니다.
   *
   * @param {number} lightId - 선택할 조명 ID
   * 선택 시 해당 조명의 색온도/강도 값을 슬라이더 상태에도 반영합니다.
   */
  const selectLight = useCallback(
    (lightId) => {
      setSelectedLightId(lightId);
      const light = lights.find((l) => l.id === lightId);
      if (light) {
        setColorTemperature(light.colorTemperature);
        setLightIntensity(light.intensity);
      }
    },
    [lights]
  );

  return {
    lights,
    selectedLightId,
    colorTemperature,
    lightIntensity,
    setColorTemperature,
    setLightIntensity,
    addLight,
    removeLight,
    updateLightPosition,
    updateLightScale,
    updateSelectedLightProperties,
    resetLights,
    selectLight,
    setSelectedLightId,
  };
};

