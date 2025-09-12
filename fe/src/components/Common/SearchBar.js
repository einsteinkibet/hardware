// src/components/Common/SearchBar.js
import React, { useState, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({ onSearch, placeholder = "Search...", delay = 300 }) => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebounce((searchTerm) => {
    onSearch(searchTerm);
  }, delay);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="search-bar position-relative">
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button
          type="button"
          className="btn btn-link position-absolute end-0 top-0 text-muted"
          onClick={handleClear}
          style={{ zIndex: 10 }}
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default SearchBar;