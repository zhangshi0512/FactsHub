import React, { useState } from "react";
import supabase from "../supabase";
import { CATEGORIES } from "../constants/categories";
import { Link } from "react-router-dom";

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();

    setIsUpdating(false);

    if (!error && data && data.length > 0) {
      setFacts((prevFacts) =>
        prevFacts.map((f) => (f.id === fact.id ? data[0] : f))
      );
    } else {
      console.error("Handle Vote Function Error on Home Page!", error);
    }
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
          <Link to={`/fact/${fact.id}`} className="fact-title-link">
            <h3 className="fact-title">{fact.title || "Untitled Fact"}</h3>
          </Link>
          <span className="fact-date">{formatDate(fact.created_at)}</span>
        </div>
        <p>
          {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
          <Link to={`/fact/${fact.id}`} className="fact-text">
            {fact.text}
          </Link>
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

export default Fact;
