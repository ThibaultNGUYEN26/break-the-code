import React from 'react';

// props: yourHand (array of cards), others (array of counts), secret (count)
export default function GameBoard({ yourHand, others, secret }) {
  return (
    <div className="game-board" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Your Hand</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {yourHand && yourHand.map((card, idx) => (
          <div key={idx} style={{
            width: 40, height: 60, border: '1px solid #333', borderRadius: 6,
            background: card.color === 'white' ? '#fff' : card.color === 'black' ? '#222' : 'orange',
            color: card.color === 'black' ? '#fff' : '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
          }}>
            {card.number}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '48px', marginBottom: '24px' }}>
        {others && others.map((count, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>Player {idx + 2}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array(count).fill(0).map((_, i) => (
                <div key={i} style={{ width: 32, height: 48, background: '#888', borderRadius: 4, border: '1px solid #333' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>Secret cards: {secret}</div>
    </div>
  );
}
