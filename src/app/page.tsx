'use client'

import React, { useState } from 'react'

const Page = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); 
    const answer = "sskjbd";
    setAnswer(answer as string);
    setLoading(false);
  };

  return (
    <div>
      <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
      {loading && <p>Loading...</p>}
      {answer && <p>{answer}</p>}
    </div>
  );
};

export default Page