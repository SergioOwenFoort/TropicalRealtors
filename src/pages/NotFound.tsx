import React from 'react';

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Pagina niet gevonden</h1>
      <p>De pagina die je zoekt bestaat niet of is verplaatst.</p>
      <a href="/">Ga terug naar de homepage</a>
    </div>
  );
}
