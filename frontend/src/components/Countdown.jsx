import { useEffect, useState } from 'react';

function Countdown({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (onComplete) onComplete();
    }
  }, [count, onComplete]);

  return (
    <div style={{
      fontSize: '3em',
      color: '#d4af37',
      textAlign: 'center',
      margin: '30px 0',
      fontWeight: 'bold',
      textShadow: '0 0 20px #d4af37, 0 0 40px #d4af37',
      letterSpacing: '10px',
      animation: 'pulse 1s infinite'
    }}>
      {count > 0 ? count : 'GO!'}
    </div>
  );
}

export default Countdown;
