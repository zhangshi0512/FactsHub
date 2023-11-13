import React from "react";
import SortToggle from "./SortToggle";
import { CATEGORIES } from "../constants/categories";

function CategoryFilter({ setCurrentCategory, sortOrder, onSortChange }) {
  return (
    <aside>
      {/* Pass `onSortChange` to SortToggle */}
      <SortToggle sortOrder={sortOrder} onSortChange={onSortChange} />
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CategoryFilter;
