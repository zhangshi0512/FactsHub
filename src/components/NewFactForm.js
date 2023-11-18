import React, { useState, useEffect } from "react";
import supabase from "../supabase";
import { isValidHttpUrl } from "../utils/utils";
import { CATEGORIES } from "../constants/categories";

function NewFactForm({
  setFacts,
  setShowForm,
  editMode,
  factData,
  onFactUpdated,
}) {
  console.log("NewFactForm loaded", { editMode, factData });
  const [text, setText] = useState(editMode ? factData.text : "");
  const [source, setSource] = useState(editMode ? factData.source : "");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  useEffect(() => {
    if (editMode && factData) {
      // Set state with the fact data for editing
      setText(factData.text);
      setSource(factData.source);
      setCategory(factData.category);
      setTitle(factData.title || "");
      setImageUrl(factData.image_url || "");
      setSecretKey(factData.secret_key || "");
    }
  }, [editMode, factData]);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Form submission started", {
      text,
      source,
      category,
      title,
      imageUrl,
      secretKey,
    });

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);

      let response;
      if (editMode) {
        // If editMode is true, update the existing fact
        response = await supabase
          .from("facts")
          .update({
            text,
            source,
            category,
            title,
            image_url: imageUrl,
            secret_key: secretKey,
          })
          .eq("id", factData.id);
      } else {
        // If editMode is false, create a new fact
        response = await supabase.from("facts").insert([
          {
            text,
            source,
            category,
            title,
            image_url: imageUrl,
            secret_key: secretKey,
          },
        ]);
      }

      console.log("Response from Supabase", response);

      if (response.error) {
        console.error("Error submitting fact", response.error);
        alert("Failed to submit fact. Please try again.");
      } else {
        const factResponse = response.data;
        setIsUploading(false);

        if (factResponse && factResponse.length > 0) {
          if (editMode) {
            setFacts((facts) =>
              facts.map((f) => (f.id === factData.id ? factResponse[0] : f))
            );
          } else {
            setFacts((facts) => [factResponse[0], ...facts]);
          }
          console.log("Update successful, calling onFactUpdated");
          onFactUpdated();
          resetFormFields();
          setShowForm(false);
        }
      }
    } else {
      alert("Please ensure all fields are correctly filled.");
    }
  }

  // Helper function to reset form fields
  function resetFormFields() {
    setText("");
    setSource("");
    setCategory("");
    setTitle("");
    setImageUrl("");
    setSecretKey("");
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          className="new-fact-title"
          type="text"
          placeholder="Fact title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
        />
      </div>
      <div className="form-row">
        <textarea
          className="new-fact-textarea"
          placeholder="Share a fact with the world..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isUploading}
        />
      </div>
      <span>{200 - textLength} characters left</span>
      <div className="form-row">
        <input
          value={source}
          type="text"
          placeholder="Trustworthy source URL..."
          onChange={(e) => setSource(e.target.value)}
          disabled={isUploading}
        />
        <input
          type="text"
          placeholder="Image URL (optional)..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={isUploading}
        />
      </div>
      <div className="form-row">
        <input
          type="text"
          placeholder="Secret key for editing..."
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          disabled={isUploading}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
        >
          <option value="">Category:</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <button
          className="btn btn-large"
          disabled={isUploading || !text || !source || !category}
        >
          Post Fact
        </button>
      </div>
    </form>
  );
}

export default NewFactForm;
