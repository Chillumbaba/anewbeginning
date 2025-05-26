import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Text {
  _id: string;
  content: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [texts, setTexts] = useState<Text[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      const response = await axios.get('/api/texts');
      setTexts(response.data);
    } catch (err) {
      setError('Failed to load texts');
      console.error('Error fetching texts:', err);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    try {
      await axios.post('/api/texts', { content: inputText });
      setInputText('');
      fetchTexts();
    } catch (err) {
      setError('Failed to save text');
      console.error('Error saving text:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
    </div>
  );
};

export default Home; 