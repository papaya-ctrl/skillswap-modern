function Pagination({ currentPage, lastPage, onPageChange, isLoading }) {
  if (lastPage <= 1) {
    return null
  }

  const pages = Array.from({ length: lastPage }, (_, index) => index + 1)

  return (
    <nav className="pagination" aria-label="Post pagination">
      <button
        type="button"
        className="button--ghost"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        Previous
      </button>

      <div className="pagination__pages">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`pagination__page${page === currentPage ? ' pagination__page--active' : ''}`}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="button--ghost"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage || isLoading}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination
