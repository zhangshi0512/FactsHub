import React, { useState } from "react";
import supabase from "../supabase";
import { isValidHttpUrl } from "../utils/utils";
import { CATEGORIES } from "../constants/categories";

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
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
        .insert([
          {
            text,
            source,
            category,
            title,
            image_url: imageUrl,
            secret_key: secretKey,
          },
        ])
        .select();
      setIsUploading(false);

      // 4. Add the new fact to the UI: add the fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      // 5. Reset input fields
      setText("");
      setSource("");
      setCategory("");
      setTitle("");
      setImageUrl("");
      setSecretKey("");

      // 6. Close the form
      setShowForm(false);
    }
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
