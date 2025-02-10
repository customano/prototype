import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      if (response.ok) {
        setInputText('');
        fetchMessages();
      } else {
        console.error('Failed to submit message');
      }
    } catch (error) {
      console.error('Error submitting message:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>Customato Prototype</title>
      </Head>
      <h1>Customato Prototype</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here"
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>Submit</button>
      </form>
      <ul style={{ marginTop: '20px' }}>
        {messages.map((msg, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>{msg.text}</li>
        ))}
      </ul>
    </div>
  );
}
