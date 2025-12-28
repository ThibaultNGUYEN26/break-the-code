import React, { useState } from 'react';


// All possible numbers for the game, with color


// Remove black 5 and replace with orange card in black row
const BLACK_NUMBERS = Array(10).fill(0).map((_, i) => i === 5 ? null : { number: i, color: 'black' }).filter(Boolean);
const WHITE_NUMBERS = Array(10).fill(0).map((_, i) => ({ number: i, color: 'white' }));
const ORANGE_CARDS = [
  { number: 5, color: 'orange', row: 'black' },
  { number: 5, color: 'orange', row: 'white' }
];

// Place orange 5 between 4 and 6 in both rows
const ALL_NUMBERS = [
  ...BLACK_NUMBERS.slice(0, 4),
  ORANGE_CARDS[0],
  ...BLACK_NUMBERS.slice(4),
  ...WHITE_NUMBERS.slice(0, 4),
  ORANGE_CARDS[1],
  ...WHITE_NUMBERS.slice(4)
];

export default function NumberBoard({ onTick }) {
  const [ticked, setTicked] = useState(Array(ALL_NUMBERS.length).fill(false));

  const handleTick = idx => {
    const updated = [...ticked];
    updated[idx] = !updated[idx];
    setTicked(updated);
    if (onTick) onTick(ALL_NUMBERS[idx], updated[idx]);
  };

  // Helper to render a row of cards
  const renderRow = (cards, offset = 0) => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: 8 }}>
      {cards.map((card, idx) => (
        <div key={card.color + card.number + (card.row || '')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 40, height: 60 }}>
            <button
              style={{
                width: 40,
                height: 60,
                fontSize: 24,
                borderRadius: 8,
                border: ticked[offset + idx] ? '2px solid #4caf50' : '2px solid #333',
                background:
                  card.color === 'white' ? '#fff' :
                  card.color === 'black' ? '#222' : 'orange',
                color: card.color === 'black' ? '#fff' : '#222',
                cursor: 'pointer',
                marginBottom: 4,
                opacity: ticked[offset + idx] ? 0.6 : 1,
                position: 'absolute',
                left: 0,
                top: 0
              }}
              onClick={() => handleTick(offset + idx)}
            >
              {card.number}
            </button>
            {ticked[offset + idx] && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 40,
                height: 60,
                pointerEvents: 'none',
                zIndex: 2
              }}>
                <svg width="40" height="60" style={{ position: 'absolute', left: 0, top: 0 }}>
                  <line x1="38" y1="2" x2="2" y2="58" stroke="#d32f2f" strokeWidth="3" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ margin: '24px 0' }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%" }}>
        {ALL_NUMBERS.map((num, idx) => (
          <button
            key={num.number}
            onClick={() => handleTick(idx)}
            style={{
              width: 40,
              height: 40,
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 8,
              border: ticked[idx] ? "2px solid #4caf50" : "2px solid #333",
              background: num.color === 'black' ? "#222" : num.color === 'white' ? "#fff" : "orange",
              color: num.color === 'black' ? "#fff" : "#222",
              margin: 4,
              cursor: 'pointer'
            }}
          >
            {num.number}
          </button>
        ))}
      </div>
    </div>
  );
}
