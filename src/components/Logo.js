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
      viewBox="0 0 220 60"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo logo-${variant}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
          <stop offset="2.5%" style={{ stopColor: "#fefeff", stopOpacity: 0.995 }} />
          <stop offset="5%" style={{ stopColor: "#fdfdfe", stopOpacity: 0.99 }} />
          <stop offset="7.5%" style={{ stopColor: "#fcfcfe", stopOpacity: 0.985 }} />
          <stop offset="10%" style={{ stopColor: "#fafbff", stopOpacity: 0.98 }} />
          <stop offset="12.5%" style={{ stopColor: "#f9faff", stopOpacity: 0.975 }} />
          <stop offset="15%" style={{ stopColor: "#f7f9ff", stopOpacity: 0.97 }} />
          <stop offset="17.5%" style={{ stopColor: "#f6f8ff", stopOpacity: 0.965 }} />
          <stop offset="20%" style={{ stopColor: "#f5f7ff", stopOpacity: 0.96 }} />
          <stop offset="22.5%" style={{ stopColor: "#f3f6ff", stopOpacity: 0.955 }} />
          <stop offset="25%" style={{ stopColor: "#f2f5ff", stopOpacity: 0.95 }} />
          <stop offset="27.5%" style={{ stopColor: "#f1f4ff", stopOpacity: 0.945 }} />
          <stop offset="30%" style={{ stopColor: "#f0f3ff", stopOpacity: 0.94 }} />
          <stop offset="32.5%" style={{ stopColor: "#eef2ff", stopOpacity: 0.935 }} />
          <stop offset="35%" style={{ stopColor: "#edf1ff", stopOpacity: 0.93 }} />
          <stop offset="37.5%" style={{ stopColor: "#ebefff", stopOpacity: 0.925 }} />
          <stop offset="40%" style={{ stopColor: "#e8ecff", stopOpacity: 0.91 }} />
          <stop offset="42.5%" style={{ stopColor: "#e6eaff", stopOpacity: 0.905 }} />
          <stop offset="45%" style={{ stopColor: "#e4e9ff", stopOpacity: 0.9 }} />
          <stop offset="47.5%" style={{ stopColor: "#e2e8ff", stopOpacity: 0.895 }} />
          <stop offset="50%" style={{ stopColor: "#e0e7ff", stopOpacity: 0.88 }} />
          <stop offset="52.5%" style={{ stopColor: "#dde5ff", stopOpacity: 0.875 }} />
          <stop offset="55%" style={{ stopColor: "#dae3ff", stopOpacity: 0.87 }} />
          <stop offset="57.5%" style={{ stopColor: "#d8e1ff", stopOpacity: 0.865 }} />
          <stop offset="60%" style={{ stopColor: "#d6deff", stopOpacity: 0.85 }} />
          <stop offset="62.5%" style={{ stopColor: "#d3dcfe", stopOpacity: 0.845 }} />
          <stop offset="65%" style={{ stopColor: "#d0d9fe", stopOpacity: 0.84 }} />
          <stop offset="67.5%" style={{ stopColor: "#ced7fe", stopOpacity: 0.835 }} />
          <stop offset="70%" style={{ stopColor: "#cbd5fe", stopOpacity: 0.82 }} />
          <stop offset="72.5%" style={{ stopColor: "#c7d2fe", stopOpacity: 0.815 }} />
          <stop offset="75%" style={{ stopColor: "#c4d0fe", stopOpacity: 0.81 }} />
          <stop offset="77.5%" style={{ stopColor: "#c0cdfe", stopOpacity: 0.805 }} />
          <stop offset="80%" style={{ stopColor: "#bcc9fe", stopOpacity: 0.78 }} />
          <stop offset="82.5%" style={{ stopColor: "#b6c5fd", stopOpacity: 0.775 }} />
          <stop offset="85%" style={{ stopColor: "#b0c1fd", stopOpacity: 0.77 }} />
          <stop offset="87.5%" style={{ stopColor: "#aabdfd", stopOpacity: 0.765 }} />
          <stop offset="90%" style={{ stopColor: "#a8b9fd", stopOpacity: 0.73 }} />
          <stop offset="92.5%" style={{ stopColor: "#9db0fc", stopOpacity: 0.72 }} />
          <stop offset="95%" style={{ stopColor: "#8fa5fb", stopOpacity: 0.71 }} />
          <stop offset="97.5%" style={{ stopColor: "#7a94f9", stopOpacity: 0.695 }} />
          <stop offset="100%" style={{ stopColor: "#667eea", stopOpacity: 0.68 }} />
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
          const size = 30 - (layerIndex * 1.8); // 30부터 13.8까지
          const x = (30 - size) / 2;
          const opacity = 0.04 + (layerIndex * 0.045); // 0.04부터 0.445까지
          const rx = 5 - (layerIndex * 0.35); // 5부터 1.85까지
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
        <rect
          x="10"
          y="10"
          width="26"
          height="26"
          rx="4"
          fill="url(#glowGradient)"
          filter="url(#glow)"
        />
      </g>

      <text
        x="45"
        y="38"
        fontFamily="'Inter', 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        fill="#ffffff"
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

