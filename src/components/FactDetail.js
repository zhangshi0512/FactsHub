// FactDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../supabase";
import "../style.css";

function FactDetail({ setFacts }) {
  // Ensure setFacts is destructured from props
  const { factId } = useParams(); // Get the factId from the URL
  const [fact, setFact] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Moved isDisputed inside useEffect to ensure fact is loaded before accessing its properties
  useEffect(() => {
    let isDisputed = false;
    if (fact) {
      isDisputed =
        fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;
    }

    async function fetchFactAndComments() {
      try {
        // Fetch the fact
        let { data: factData, error: factError } = await supabase
          .from("facts")
          .select("*")
          .eq("id", factId)
          .single();

        if (factError) throw factError;

        setFact(factData);
        isDisputed =
          factData.votesInteresting + factData.votesMindblowing <
          factData.votesFalse;
        // Fetch comments
        let { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("facts_id", factId);

        if (commentsError) throw commentsError;

        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching data", error);
        setError(error.message);
      }
    }

    fetchFactAndComments();
  }, [factId]);

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .single();
    setIsUpdating(false);

    if (error) {
      console.error("Error updating votes", error);
    } else {
      setFact((currentFact) => ({ ...currentFact, ...updatedFact }));
      setFacts((prevFacts) =>
        prevFacts.map((f) => (f.id === updatedFact.id ? updatedFact : f))
      );
    }
  }

  if (error) {
    return <div className="message">Error: {error}</div>;
  }

  if (!fact) {
    return <div className="message">Loading...</div>;
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submit behavior

    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    // Optimistic update: add the comment to the UI before the request completes
    const optimisticComment = {
      content: newComment,
      user_id: "currentUserId", // Replace with actual current user's ID
      created_at: new Date().toISOString(), // Use the current timestamp
      id: Date.now(), // Temporary ID for the optimistic update
    };
    setComments((prevComments) => [...prevComments, optimisticComment]);
    setNewComment(""); // Clear the input field

    // Now, submit the new comment to the backend
    const { data, error } = await supabase.from("comments").insert([
      {
        facts_id: factId,
        content: newComment,
      },
    ]);

    if (error) {
      console.error("Error submitting comment", error);
      // Rollback the optimistic update
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== optimisticComment.id)
      );
      alert("Failed to submit comment. Please try again.");
    } else {
      // Replace the optimistic comment with the actual data from the backend
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === optimisticComment.id ? data[0] : comment
        )
      );
    }
  };

  // Function to format the timestamp
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to format comment timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")} at ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
    return formattedTime;
  };

  return (
    <div className="main-detail">
      <Link to="/" className="btn btn-category">
        Back to Facts
      </Link>
      {/* Fact details */}
      <article className="fact-detail">
        <div className="fact-content">
          <div className="fact-header">
            <h3 className="fact-title">{fact.title}</h3>
            <span className="fact-date">{formatDate(fact.created_at)}</span>
          </div>
          <p className="fact-text">{fact.text}</p>
          {fact.image_url && (
            <img src={fact.image_url} alt="Fact" className="fact-image" />
          )}
          <span className="fact-user-id">
            User ID: {fact.user_id?.substring(0, 6)}
          </span>
        </div>

        {fact && (
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
        )}
      </article>
      {/* Comments section */}
      <section className="comments">
        <h3>Comments:</h3>
        <ul>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <li key={comment.id} className="fact">
                <div className="fact-content">
                  <p className="fact-text">{comment.content}</p>
                  <span className="fact-user-id">
                    Commented by user: {comment.user_id.substring(0, 6)} on{" "}
                    {formatTimestamp(comment.created_at)}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <p className="message">No comments yet.</p>
          )}
        </ul>
      </section>
      {/* New comment form */}
      <form onSubmit={handleCommentSubmit} className="comment-form">
        <textarea
          className="new-comment-textarea"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Your comment"
          style={{ resize: "vertical" }}
        ></textarea>
        <button type="submit" className="btn toggle-btn">
          Submit Comment
        </button>
      </form>
    </div>
  );
}

export default FactDetail;
