import React, { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [responseList, setResponseList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    setResponseList((prev) => [...prev, { role: "user", text: currentQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://192.168.36.199:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      const data = await res.json();
      const reply = data.response || data.error || "Something went wrong";

      setResponseList((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setResponseList((prev) => [...prev, { role: "bot", text: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {responseList.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-message bot">Typing...</div>}
      </div>

      <div className="chat-input">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question and press Enter..."
        />
        <button onClick={handleAsk} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
