import { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span style={{ fontSize: "40px" }}>{count}</span>
      <button className="btn btn-large" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

function SortToggle({ sortOrder, onToggle }) {
  return (
    <div className="sort-toggle-container">
      <button
        className={`toggle-btn ${
          sortOrder === "votesInteresting" ? "active" : ""
        }`}
        onClick={() => onToggle("votesInteresting")}
      >
        Upvotes
      </button>
      <button
        className={`toggle-btn ${sortOrder === "created_at" ? "active" : ""}`}
        onClick={() => onToggle("created_at")}
      >
        Time
      </button>
    </div>
  );
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("votesInteresting");
  const [searchTerm, setSearchTerm] = useState("");

  // Function to handle toggle change
  const handleToggleSort = (newSortOrder) => {
    console.log("Sort order changed to:", newSortOrder);
    setSortOrder(newSortOrder);
  };

  useEffect(() => {
    // Log to verify that useEffect is triggered on sortOrder change
    console.log("useEffect triggered. Current sortOrder:", sortOrder);

    async function getFacts() {
      setIsLoading(true);

      let query = supabase.from("facts").select("*");

      if (currentCategory !== "all") {
        query = query.eq("category", currentCategory);
      }

      // Apply the sort order based on the sortOrder state
      const ascending = sortOrder === "created_at";
      query = query.order(sortOrder, { ascending });

      const { data: facts, error } = await query.limit(1000);

      if (!error) {
        // Log to verify the fetched data
        console.log("Facts fetched:", facts);
        setFacts(facts);
      } else {
        console.error("There was a problem getting data", error);
      }

      setIsLoading(false);
    }

    getFacts();
  }, [currentCategory, sortOrder]);

  // Function to handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase()); // Convert to lowercase for case-insensitive search
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Filter facts based on search term
  const filteredFacts = facts.filter(
    (fact) =>
      fact.title.toLowerCase().includes(searchTerm) ||
      fact.text.toLowerCase().includes(searchTerm)
  );

  return (
    <>
      <Header
        showForm={showForm}
        setShowForm={setShowForm}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
      />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter
          setCurrentCategory={setCurrentCategory}
          sortOrder={sortOrder}
          onToggle={handleToggleSort}
        />

        {isLoading ? (
          <Loader />
        ) : (
          <FactList
            filteredFacts={filteredFacts}
            setFacts={setFacts}
            searchTerm={searchTerm}
          />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

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
        onChange={onSearchChange}
        onKeyDown={handleKeyPress}
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

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  // Fixed in a video text overlay
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    // 1. Prevent browser reload
    e.preventDefault();
    console.log(text, source, category);

    // 2. Check if data is valid. If so, create a new fact
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      // 3. Upload fact to Supabase and receive the new fact object
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      // 4. Add the new fact to the UI: add the fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      // 5. Reset input fields
      setText("");
      setSource("");
      setCategory("");

      // 6. Close the form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        value={source}
        type="text"
        placeholder="Trustworthy source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory, sortOrder, onToggle }) {
  return (
    <aside>
      <SortToggle sortOrder={sortOrder} onToggle={onToggle} />
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

function FactList({ filteredFacts, setFacts, searchTerm }) {
  if (filteredFacts.length === 0)
    return <p className="message">No facts available. Share some knowledge!</p>;

  if (filteredFacts.length === 0) {
    return <p className="message">No results found for "{searchTerm}".</p>;
  }

  return (
    <section>
      <ul className="facts-list">
        {filteredFacts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>
        Displayed {filteredFacts.length} of {filteredFacts.length} facts in the
        database. Add your own!
      </p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  // Function to format the timestamp
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", options); // 'en-CA' uses the yyyy-mm-dd format
  };

  return (
    <li className="fact">
      <div className="fact-content">
        <div className="fact-header">
          <h3 className="fact-title">{fact.title || "Untitled Fact"}</h3>
          <span className="fact-date">{formatDate(fact.created_at)}</span>
        </div>
        <p>
          {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
          {fact.text}
          <a
            className="source"
            href={fact.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            (Source)
          </a>
        </p>
      </div>
      <div className="fact-footer">
        <span
          className="tag"
          style={{
            backgroundColor: CATEGORIES.find(
              (cat) => cat.name === fact.category
            )?.color,
          }}
        >
          {fact.category}
        </span>
        <div className="vote-buttons">
          <button
            onClick={() => handleVote("votesInteresting")}
            disabled={isUpdating}
          >
            👍 {fact.votesInteresting}
          </button>
          <button
            onClick={() => handleVote("votesMindblowing")}
            disabled={isUpdating}
          >
            🤯 {fact.votesMindblowing}
          </button>
          <button
            onClick={() => handleVote("votesFalse")}
            disabled={isUpdating}
          >
            ⛔️ {fact.votesFalse}
          </button>
        </div>
      </div>
    </li>
  );
}

export default App;
