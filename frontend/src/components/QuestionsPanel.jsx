import React, { useState } from 'react';

// Example: 6 questions for player to choose from
const QUESTIONS = [
  "Combien de chiffres sont pairs ?",
  "Combien de chiffres sont impairs ?",
  "Combien de chiffres sont strictement supérieurs à X ?",
  "Combien de chiffres sont strictement inférieurs à X ?",
  "Combien de chiffres sont égaux à X ?",
  "Le chiffre en position P est-il pair ?"
];

export default function QuestionsPanel({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ margin: '24px 0', textAlign: 'center' }}>
      <h3>Choisissez une question :</h3>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            style={{
              padding: '12px 18px',
              borderRadius: 8,
              border: selected === idx ? '2px solid #d4af37' : '2px solid #333',
              background: selected === idx ? '#d4af37' : '#222',
              color: selected === idx ? '#222' : '#fff',
              fontWeight: 'bold',
              fontSize: '1em',
              cursor: 'pointer',
              marginBottom: 8
            }}
            onClick={() => {
              setSelected(idx);
              if (onSelect) onSelect(idx, q);
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
