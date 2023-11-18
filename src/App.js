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
  const [sortOrder, setSortOrder] = useState("created_at_asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch and filter facts
  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      let query = supabase.from("facts").select("*");

      if (currentCategory !== "all") {
        query = query.eq("category", currentCategory);
      }

      // Extract field and order from sortOrder
      let [sortField, sortDirection] = sortOrder.split("_");
      const isAscending = sortDirection === "asc";

      // Check if sortField is 'created' and replace it with 'created_at'
      if (sortField === "created") {
        sortField = "created_at";
      }

      try {
        const { data, error } = await query
          .order(sortField, { ascending: isAscending })
          .limit(1000);

        if (error) {
          throw error;
        }

        setFacts(data);
      } catch (error) {
        console.error("Error fetching facts:", error);
      } finally {
        setIsLoading(false);
      }
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

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
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
