// FactDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NewFactForm from "./NewFactForm";
import supabase from "../supabase";
import "../style.css";

function FactDetail({ setFacts }) {
  const { factId } = useParams();
  const [fact, setFact] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [actionType, setActionType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [factUpdated, setFactUpdated] = useState(false);
  const navigate = useNavigate();

  // Pass this new function as a prop to NewFactForm
  const onFactUpdated = () => {
    console.log("onFactUpdated called");
    setFactUpdated(true);
  };

  // Moved isDisputed inside useEffect to ensure fact is loaded before accessing its properties
  useEffect(() => {
    let isDisputed = false;
    if (fact) {
      isDisputed =
        fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;
    }

    async function fetchFactAndComments() {
      console.log("Fetching fact and comments");
      try {
        // Fetch the fact
        let { data: factData, error: factError } = await supabase
          .from("facts")
          .select("*")
          .eq("id", factId)
          .single(); // Use maybeSingle() to avoid errors when no rows are found

        if (factError) {
          console.error("Error fetching fact", factError);
        } else {
          console.log("Fact data fetched", factData);
        }

        setFact(factData);
        // Fetch comments
        let { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("facts_id", factId); // Ensure the column name is correct

        if (commentsError) throw commentsError;
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching data", error);
        setError(error.message);
      }
    }

    console.log("useEffect triggered", { factId, factUpdated });
    fetchFactAndComments();

    if (factUpdated) {
      console.log("Fact was updated, re-fetching data");
      setFactUpdated(false); // Reset the flag
    }
  }, [factId, factUpdated]);

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", factId)
      .select();

    setIsUpdating(false);

    if (!error && data && data.length > 0) {
      setFact(data[0]); // Update the local state
      setFacts &&
        setFacts((prevFacts) =>
          prevFacts.map((f) => (f.id === data[0].id ? data[0] : f))
        ); // Update the global state
    } else {
      console.error("Handle Vote Function Error on Detail Page!", error);
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

    // Submit the new comment to Supabase
    const { data, error: insertError } = await supabase
      .from("comments")
      .insert([
        {
          facts_id: factId,
          content: newComment,
        },
      ]);

    if (insertError) {
      console.error("Error submitting comment", insertError);
      alert("Failed to submit comment. Please try again.");
    } else {
      // Fetch the latest comments
      const { data: latestComments, error: fetchError } = await supabase
        .from("comments")
        .select("*")
        .eq("facts_id", factId);

      if (fetchError) {
        console.error("Error fetching comments", fetchError);
      } else {
        // Update the comments state with the latest comments
        setComments(latestComments);
      }
    }
    setNewComment(""); // Clear the input field
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

  // Function to handle the Edit button click
  const handleEditClick = () => {
    setActionType("edit");
    setShowModal(true);
  };

  // Function to handle the Delete button click
  const handleDeleteClick = () => {
    setActionType("delete");
    setShowModal(true);
  };

  // Function to handle the secret key modal display
  const handleSecretKeyModal = (actionType) => {
    setActionType(actionType); // 'edit' or 'delete'
    setShowModal(true);
  };

  // Function to handle secret key input change
  const handleSecretKeyChange = (e) => {
    setSecretKey(e.target.value);
  };

  // Function to verify the secret key and perform action
  const verifyAndPerformAction = async () => {
    if (fact.secret_key === secretKey.trim()) {
      if (actionType === "edit") {
        setIsEditing(true);
        setShowModal(false);
      } else if (actionType === "delete") {
        await handleDeleteFact();
      }
    } else {
      alert("Incorrect secret key!");
    }
    setSecretKey("");
    setShowModal(false); // Close the modal
  };

  // Function to delete the fact and its comments
  const handleDeleteFact = async () => {
    // Start by deleting comments to maintain referential integrity
    const { error: deleteCommentsError } = await supabase
      .from("comments")
      .delete()
      .match({ facts_id: fact.id });

    if (deleteCommentsError) {
      console.error("Error deleting comments", deleteCommentsError);
      alert("Failed to delete comments associated with the fact.");
      return; // Stop the deletion process if there's an error
    }

    // If comments are deleted successfully, proceed to delete the fact
    const { error: deleteFactError } = await supabase
      .from("facts")
      .delete()
      .match({ id: fact.id });

    if (deleteFactError) {
      console.error("Error deleting fact", deleteFactError);
      alert("Failed to delete the fact.");
    } else {
      // Fact deleted successfully
      alert("Fact deleted successfully.");

      // Update the global state if necessary or redirect the user
      setFacts((currentFacts) => currentFacts.filter((f) => f.id !== fact.id));

      // Redirect to the home page or another appropriate route
      navigate("/");
    }
  };

  return (
    <div className="main-detail">
      <Link to="/" className="btn btn-category">
        Back to Facts
      </Link>

      {isEditing && fact ? (
        // Render the NewFactForm when in edit mode
        <div className="new-fact-form-container">
          <NewFactForm
            setFacts={setFacts}
            setShowForm={setIsEditing}
            editMode={true}
            factData={fact}
            onFactUpdated={onFactUpdated}
          />
        </div>
      ) : (
        // Render the fact details when not in edit mode
        <>
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
                <button onClick={handleEditClick}>Edit</button>
                <button onClick={handleDeleteClick}>Delete</button>
              </div>
            )}
          </article>

          {/* Modal for secret key verification */}
          {showModal && (
            <div className="fact-detail">
              <input
                className="input-style"
                type="password"
                placeholder="Enter secret key"
                value={secretKey}
                onChange={handleSecretKeyChange}
              />
              <div className="vote-buttons">
                <button onClick={verifyAndPerformAction}>Verify</button>
              </div>
            </div>
          )}

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
        </>
      )}
    </div>
  );
}

export default FactDetail;
