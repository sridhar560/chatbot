import React, { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState([]);
  const [responseList, setResponseList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    setResponseList((prev) => [
      ...prev,
      { role: "user", text: currentQuestion },
    ]);
    setQuestion("");
    setLoading(true);

    try {
      let res;
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("question", currentQuestion);
        for (let file of files) {
          formData.append("files", file);
        }

        res = await fetch("http://192.168.43.137:5000/ask-file", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("http://192.168.43.137:5000/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: currentQuestion }),
        });
      }

      const data = await res.json();
      const reply = data.response || data.error || "Something went wrong";
      setResponseList((prev) => [
        ...prev,
        { role: "bot", text: reply },
      ]);
    } catch (err) {
      setResponseList((prev) => [
        ...prev,
        { role: "bot", text: "Connection error." },
      ]);
    } finally {
      setLoading(false);
      setFiles([]);
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
            {msg.role === "user" ? (
              "👤" // User emoji
            ) : (
              "🤖" // Bot emoji
            )}
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chat-message bot">
            🤖
            Typing...
          </div>
        )}
      </div>

      <div className="chat-input">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question and press Enter..."
        />
        <div className="input-file-container">
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
        </div>
        <button onClick={handleAsk} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
