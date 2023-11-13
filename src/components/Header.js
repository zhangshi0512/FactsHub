import React from "react";

function Header({ showForm, setShowForm, onSortChange, onSearchChange }) {
  const appTitle = "Fun Facts Share !";

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default action of submitting the form
      onSearchChange(e);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Fun Facts Share Logo" />
        <h1>{appTitle}</h1>
      </div>
      <input
        type="text"
        placeholder="Search facts..."
        className="search-bar"
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSearchChange(e.target.value);
          }
        }}
      />
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

export default Header;
