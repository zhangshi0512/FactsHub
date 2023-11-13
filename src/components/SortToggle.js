// SortToggle.js
import React from "react";

function SortToggle({ sortOrder, onSortChange }) {
  return (
    <div className="sort-toggle-container">
      <button
        className={`toggle-btn ${
          sortOrder === "votesInteresting" ? "active" : ""
        }`}
        onClick={() => onSortChange("votesInteresting")}
      >
        Upvotes
      </button>
      <button
        className={`toggle-btn ${sortOrder === "created_at" ? "active" : ""}`}
        onClick={() => onSortChange("created_at")}
      >
        Time
      </button>
    </div>
  );
}

export default SortToggle;
