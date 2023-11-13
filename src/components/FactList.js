import React from "react";
import Fact from "./Fact";

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return <p className="message">No facts available. Share some knowledge!</p>;
  }

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

export default FactList;
