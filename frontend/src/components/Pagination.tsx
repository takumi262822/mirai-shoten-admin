interface Props {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

/** ページネーションコンポーネント */
export function Pagination({ total, page, limit, onPageChange }: Props) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← 前
      </button>
      <span className="pagination__info">
        {page} / {totalPages} ページ（全 {total} 件）
      </span>
      <button
        className="pagination__btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        次 →
      </button>
    </div>
  );
}
