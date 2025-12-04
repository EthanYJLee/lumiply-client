// import React, { useState, useRef, useEffect } from "react";

// /**
//  * 컨트롤 패널 컴포넌트
//  */
// const ControlPanel = ({
//   selectedLightId,
//   colorTemperature,
//   lightIntensity,
//   onColorTemperatureChange,
//   onLightIntensityChange,
// }) => {
//   const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
//   const colorPickerRef = useRef(null);
//   const buttonRef = useRef(null);

//   // 외부 클릭 시 팔레트 닫기
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         colorPickerRef.current &&
//         buttonRef.current &&
//         !colorPickerRef.current.contains(event.target) &&
//         !buttonRef.current.contains(event.target)
//       ) {
//         setIsColorPickerOpen(false);
//       }
//     };

//     if (isColorPickerOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       return () => {
//         document.removeEventListener("mousedown", handleClickOutside);
//       };
//     }
//   }, [isColorPickerOpen]);

//   if (!selectedLightId) {
//     return (
//       <div className="control-panel">
//         <div className="control-placeholder">
//           <p>조명을 선택·추가하세요</p>
//           <p style={{ marginTop: "6px" }}></p>
//           <p className="control-hint">좌측에서 조명을 클릭한 뒤</p>
//           <p className="control-hint">드래그하여 배치할 수 있습니다</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="control-panel">
//       {/* 색온도 팔레트 */}
//       <div className="control-section">
//         <div className="control-label">색온도</div>
//         <div className="color-picker-wrapper">
//           <button
//             ref={buttonRef}
//             className="color-picker-button"
//             onClick={(e) => {
//               e.stopPropagation();
//               setIsColorPickerOpen(!isColorPickerOpen);
//             }}
//             style={{ backgroundColor: colorTemperature }}
//           >
//             <span className="color-picker-button-text">색상 선택</span>
//           </button>
//           {isColorPickerOpen && (
//             <div ref={colorPickerRef} className="color-picker-dropdown">
//               <input
//                 type="color"
//                 value={colorTemperature}
//                 onChange={(e) => {
//                   onColorTemperatureChange(e.target.value);
//                 }}
//                 className="color-picker-input"
//               />
//               <div className="color-preview" style={{ backgroundColor: colorTemperature }}></div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 광량 조절 */}
//       <div className="control-section">
//         <div className="control-label">광량: {lightIntensity}%</div>
//         <input
//           type="range"
//           min="0"
//           max="100"
//           value={lightIntensity}
//           onChange={(e) => onLightIntensityChange(Number(e.target.value))}
//           className="intensity-slider"
//         />
//       </div>
//     </div>
//   );
// };

// export default ControlPanel;
