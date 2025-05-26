import React, { useState, useEffect } from 'react';

interface Text {
  _id: string;
  content: string;
  createdAt: string;
}

// API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
console.log('Using API URL:', API_URL); // Add logging to help debug

function App() {
  const [inputText, setInputText] = useState('');
  const [texts, setTexts] = useState<Text[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing texts on component mount
  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/texts`);
      if (!response.ok) {
        throw new Error('Failed to fetch texts');
      }
      const data = await response.json();
      setTexts(data);
    } catch (err) {
      setError('Failed to load texts');
      console.error('Error fetching texts:', err);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/texts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to save text');
      }

      // Clear input and refresh texts
      setInputText('');
      fetchTexts();
    } catch (err) {
      setError('Failed to save text');
      console.error('Error saving text:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>A New Beginning</h1>
      </header>
      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text..."
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '70%',
              marginRight: '10px'
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}

        <div>
          <h2>Previous Entries</h2>
          {texts.length === 0 ? (
            <p>No entries yet. Add your first text!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {texts.map((text) => (
                <li
                  key={text._id}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}
                >
                  <div>{text.content}</div>
                  <small style={{ color: '#666' }}>
                    {new Date(text.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 