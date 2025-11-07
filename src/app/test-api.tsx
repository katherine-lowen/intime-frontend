'use client';
import { useEffect, useState } from 'react';

export default function TestAPI() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Error:', err));
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Backend Connection Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
