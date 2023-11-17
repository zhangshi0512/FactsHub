// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "./supabase";
import Header from "./components/Header";
import Loader from "./components/Loader";
import CategoryFilter from "./components/CategoryFilter";
import FactList from "./components/FactList";
import NewFactForm from "./components/NewFactForm";
import FactDetail from "./components/FactDetail";
import "./style.css";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [filteredFacts, setFilteredFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("votesInteresting");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch and filter facts
  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      let query = supabase.from("facts").select("*");
      if (currentCategory !== "all") {
        query = query.eq("category", currentCategory);
      }
      const { data, error } = await query
        .order(sortOrder, { ascending: sortOrder === "created_at" })
        .limit(1000);
      setIsLoading(false);
      if (error) {
        console.error("Error fetching facts:", error);
        return;
      }
      setFacts(data);
    }

    getFacts();
  }, [currentCategory, sortOrder]);

  // Update filtered facts when facts or searchTerm changes
  useEffect(() => {
    const filtered = facts.filter(
      (fact) =>
        fact &&
        (fact.title.toLowerCase().includes(searchTerm) ||
          fact.text.toLowerCase().includes(searchTerm))
    );
    setFilteredFacts(filtered);
  }, [facts, searchTerm]);

  const handleSearchChange = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  return (
    <Router>
      <Header
        showForm={showForm}
        setShowForm={setShowForm}
        onSearchChange={handleSearchChange}
      />
      {showForm && (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      )}
      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <CategoryFilter
                  setCurrentCategory={setCurrentCategory}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
                {isLoading ? (
                  <Loader />
                ) : (
                  <FactList facts={filteredFacts} setFacts={setFacts} />
                )}
              </>
            }
          />
          <Route
            path="/fact/:factId"
            element={<FactDetail setFacts={setFacts} />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
