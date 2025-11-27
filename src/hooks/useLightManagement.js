import { useState, useCallback } from "react";
import {
  DEFAULT_COLOR_TEMPERATURE,
  DEFAULT_LIGHT_INTENSITY,
  DEFAULT_LIGHT_SCALE,
} from "../constants/defaultValues";

/**
 * 조명 관리를 위한 커스텀 훅
 * @returns {Object} 조명 상태 및 핸들러
 */
export const useLightManagement = () => {
  const [lights, setLights] = useState([]);
  const [selectedLightId, setSelectedLightId] = useState(null);
  const [colorTemperature, setColorTemperature] = useState(DEFAULT_COLOR_TEMPERATURE);
  const [lightIntensity, setLightIntensity] = useState(DEFAULT_LIGHT_INTENSITY);

  /**
   * 새 조명 추가
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
   * 조명 제거
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
   * 조명 위치 업데이트
   */
  const updateLightPosition = useCallback((lightId, position) => {
    // 위치는 useDragAndDrop에서 이미 제한되므로 그대로 사용
    setLights((prev) =>
      prev.map((light) => (light.id === lightId ? { ...light, position } : light))
    );
  }, []);

  /**
   * 조명 스케일 업데이트
   */
  const updateLightScale = useCallback((lightId, scale) => {
    setLights((prev) =>
      prev.map((light) => (light.id === lightId ? { ...light, scale } : light))
    );
  }, []);

  /**
   * 선택된 조명의 속성 업데이트
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
   * 모든 조명 초기화
   */
  const resetLights = useCallback(() => {
    setLights([]);
    setSelectedLightId(null);
    setColorTemperature(DEFAULT_COLOR_TEMPERATURE);
    setLightIntensity(DEFAULT_LIGHT_INTENSITY);
  }, []);

  /**
   * 조명 선택
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

