import React from "react";

const ResultHistory = ({ history, activeId, onSelect }) => {
  const items = history || [];

  return (
    <div className="result-history-card">
      <div className="result-history-header">
        <div className="result-history-title">결과 히스토리</div>
        <div className="result-history-count">{items.length}</div>
      </div>
      <div className="result-history-list">
        {items.length === 0 ? (
          <div className="result-history-empty">
            아직 생성된 결과가 없습니다.
            <br />
            이미지를 업로드하고
            <br />
            조명을 적용해 보세요.
          </div>
        ) : (
          items.map((entry) => {
            const thumbSrc = entry.resultUrl || entry.previewUrl;
            const date = new Date(entry.createdAt);
            const timeLabel = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
            const isActive = activeId === entry.id;

            return (
              <button
                key={entry.id}
                type="button"
                className={`result-history-item ${isActive ? "result-history-item-active" : ""}`}
                onClick={() => onSelect && onSelect(entry.id)}
              >
                <div className="result-history-thumb-wrapper">
                  {thumbSrc ? (
                    <img src={thumbSrc} alt="Result thumbnail" className="result-history-thumb" />
                  ) : (
                    <div className="result-history-thumb placeholder" />
                  )}
                </div>
                <div className="result-history-meta">
                  <div className="result-history-meta-top">
                    <span className="result-history-time">{timeLabel}</span>
                  </div>
                  {entry.message && <div className="result-history-message">{entry.message}</div>}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResultHistory;
