import { useState } from 'react';

async function sendMessage(message) {
  const res = await fetch("https://your-heroku-backend.herokuapp.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data.response;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    try {
      const aiText = await sendMessage(input);
      const aiMsg = { role: 'ai', text: aiText };
      setMessages((msgs) => [...msgs, aiMsg]);
    } catch {
      const errMsg = { role: 'ai', text: "⚠️ Error: Could not reach backend." };
      setMessages((msgs) => [...msgs, errMsg]);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>💡 Hybrid AI Chatbot</h1>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: m.role === 'user' ? '#DCF8C6' : '#E0E0E0',
            }}
          >
            <strong>{m.role === 'user' ? "You" : "AI"}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    height: '100vh',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '1rem',
  },
  chatBox: {
    flex: 1,
    width: '100%',
    maxWidth: '600px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#FAFAFA',
    marginBottom: '1rem',
  },
  message: {
    padding: '10px 15px',
    borderRadius: '15px',
    maxWidth: '70%',
    whiteSpace: 'pre-wrap',
  },
  inputArea: {
    display: 'flex',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '600px',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '10px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#007BFF',
    color: '#fff',
    cursor: 'pointer',
  }
};

export default App;
