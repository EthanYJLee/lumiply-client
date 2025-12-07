import React from "react";
import "./Logo.css";

const Logo = ({ size = "medium", variant = "default" }) => {
  const sizeMap = {
    small: { width: 120, height: 36, iconSize: 16, fontSize: 18 },
    medium: { width: 200, height: 60, iconSize: 20, fontSize: 28 },
    large: { width: 300, height: 90, iconSize: 30, fontSize: 42 },
  };

  const { width, height, iconSize, fontSize } = sizeMap[size] || sizeMap.medium;

  return (
    <svg
      width={width}
      height={height}
      /* 내부 아이콘 + 텍스트 묶음이 실제로 수평 중앙에 오도록 viewBox의 min-x를 살짝 음수로 조정 */
      viewBox="0 0 210 55"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo logo-${variant}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Cloud Dancer(#f1f0ec)를 중심으로 한 따뜻한 뉴트럴-로즈 그라디언트 */}
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
          <stop offset="10%" style={{ stopColor: "#f7f6f2", stopOpacity: 0.98 }} />
          <stop offset="25%" style={{ stopColor: "#f1f0ec", stopOpacity: 0.96 }} />
          <stop offset="45%" style={{ stopColor: "#f4e3d7", stopOpacity: 0.94 }} />
          <stop offset="65%" style={{ stopColor: "#e6cabb", stopOpacity: 0.9 }} />
          <stop offset="82%" style={{ stopColor: "#cfa58b", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "#a47864", stopOpacity: 0.8 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="bgGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        </filter>
      </defs>

      <g transform="translate(5, 5)">
        {Array.from({ length: 10 }, (_, i) => {
          const layerIndex = 9 - i; // 역순으로 그리기 (가장 큰 것부터)
          const size = 30 - layerIndex * 1.8; // 30부터 13.8까지
          const x = (30 - size) / 2;
          const opacity = 0.04 + layerIndex * 0.045; // 0.04부터 0.445까지
          const rx = 5 - layerIndex * 0.35; // 5부터 1.85까지
          return (
            <rect
              key={i}
              x={x}
              y={x}
              width={size}
              height={size}
              rx={rx}
              fill="url(#glowGradient)"
              opacity={opacity}
              filter={layerIndex === 0 ? "url(#bgGlow)" : undefined}
            />
          );
        })}
        <rect x="10" y="10" width="26" height="26" rx="4" fill="url(#glowGradient)" filter="url(#glow)" />
      </g>

      <text
        x="45"
        y="38"
        fontFamily="'Inter', 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        /* Cloud Dancer 계열 배경에서도 또렷하게 보이도록 딥 뉴트럴 텍스트 컬러 사용 */
        fill="#2b2622"
        letterSpacing="-0.8"
      >
        Lumiply
      </text>
      <text
        x="45"
        y="38"
        fontFamily="'Inter', 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        fill="url(#glowGradient)"
        opacity="0.8"
        letterSpacing="-0.8"
        filter="url(#glow)"
      >
        Lumiply
      </text>
    </svg>
  );
};

export default Logo;
