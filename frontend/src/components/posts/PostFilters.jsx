const postTypeOptions = [
  { value: '', label: 'All post types' },
  { value: 'offer', label: 'Offering a skill' },
  { value: 'request', label: 'Requesting help' },
]

function PostFilters({
  filters,
  categories,
  onChange,
  onSubmit,
  onReset,
  isLoading,
}) {
  return (
    <form className="filters-card" onSubmit={onSubmit}>
      <div className="filters-grid">
        <div className="field">
          <label htmlFor="query">Keyword search</label>
          <input
            id="query"
            name="query"
            type="search"
            value={filters.query}
            onChange={onChange}
            placeholder="Search title or description"
          />
        </div>

        <div className="field">
          <label htmlFor="category_id">Category</label>
          <select
            id="category_id"
            name="category_id"
            value={filters.category_id}
            onChange={onChange}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="post_type">Post type</label>
          <select
            id="post_type"
            name="post_type"
            value={filters.post_type}
            onChange={onChange}
          >
            {postTypeOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters-actions">
        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Apply filters'}
        </button>
        <button type="button" className="button--ghost" onClick={onReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  )
}

export default PostFilters
