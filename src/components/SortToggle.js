import React from "react";

function SortToggle({ sortOrder, onSortChange }) {
  const handleSortChange = (sortField) => {
    // Use 'created_at' consistently instead of 'created'
    sortField = sortField === "created" ? "created_at" : sortField;

    // Determine the current direction based on the sortOrder
    const currentDirection = sortOrder.includes(`${sortField}_asc`)
      ? "asc"
      : "desc";
    const newDirection = currentDirection === "asc" ? "desc" : "asc";

    // Call onSortChange with the new sort order
    onSortChange(`${sortField}_${newDirection}`);
  };

  // Determine active buttons
  const isUpvotesActive = sortOrder.includes("votesInteresting");
  const isTimeActive = sortOrder.includes("created_at");

  return (
    <div className="sort-toggle-container">
      <button
        className={`toggle-btn ${isUpvotesActive ? "active" : ""}`}
        onClick={() => handleSortChange("votesInteresting")}
      >
        Upvotes
      </button>
      <button
        className={`toggle-btn ${isTimeActive ? "active" : ""}`}
        onClick={() => handleSortChange("created_at")}
      >
        Time
      </button>
    </div>
  );
}

export default SortToggle;
