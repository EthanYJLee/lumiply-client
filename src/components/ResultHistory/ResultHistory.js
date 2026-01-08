import React from "react";
import { proxiedImageUrl } from "../../utils/imageUtils";

/**
 * 생성된 결과들을 시간 순으로 나열해 주는 히스토리 패널입니다.
 *
 * - 각 항목은 합성 프리뷰(입력+조명)를 우선 썸네일로 사용하고, 없으면 결과 이미지를 사용합니다.
 * - 키보드/스크린리더 접근성을 위해 role="button" 과 키보드 핸들러를 함께 제공합니다.
 */
const ResultHistory = ({ history, activeId, onSelect, onRemove, onClearAll }) => {
  const items = history || [];

  return (
    <div className="result-history-card">
      <div className="result-history-header">
        <div className="result-history-title">결과 히스토리</div>
        <div className="result-history-header-right">
          <div className="result-history-count">{items.length}</div>
          {items.length > 0 && (
            <button type="button" className="result-history-clear-all" onClick={onClearAll}>
              전체 삭제
            </button>
          )}
        </div>
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
            // 우선순위: 합성 프리뷰(입력+조명) > 결과 이미지
            const thumbSrc = entry.previewUrl || entry.resultUrl;
            const date = new Date(entry.createdAt);
            const timeLabel = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
            const isActive = activeId === entry.id;

            return (
              <div
                key={entry.id}
                role="button"
                tabIndex={0}
                className={`result-history-item ${isActive ? "result-history-item-active" : ""}`}
                onClick={() => onSelect && onSelect(entry.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect && onSelect(entry.id);
                  }
                }}
              >
                <div className="result-history-thumb-wrapper">
                  {thumbSrc ? (
                    <img src={proxiedImageUrl(thumbSrc)} alt="Result thumbnail" className="result-history-thumb" />
                  ) : (
                    <div className="result-history-thumb placeholder" />
                  )}
                </div>
                <div className="result-history-meta">
                  <div className="result-history-meta-top">
                    <span className="result-history-time">{timeLabel}</span>
                    {onRemove && (
                      <button
                        type="button"
                        className="result-history-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(entry.id);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {entry.message && <div className="result-history-message">{entry.message}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResultHistory;
