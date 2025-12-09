import React from "react";

/**
 * 이미지 업로드 영역 컴포넌트
 */
const UploadZone = ({ getRootProps, getInputProps, isDragActive }) => {
  return (
    <div className="upload-container">
      <div {...getRootProps()} className={`upload-zone ${isDragActive ? "drag-active" : ""}`}>
        <input {...getInputProps()} />
        <div className="upload-content">
          <div className="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 15V3M12 3L8 7M12 3L16 7M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {isDragActive ? (
            <p className="upload-text">이미지를 여기에 놓으세요</p>
          ) : (
            <>
              <p className="upload-text">
                <span className="upload-highlight">클릭·드래그</span>를 통해
                <br />
                이미지를 업로드하세요
              </p>
              <p className="upload-hint">PNG, JPG, JPEG, WEBP 지원</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
