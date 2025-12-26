import './WaitingRoom.css'

function WaitingRoom({ currentRoom, username, players, isHost, loading, onStartGame }) {
  return (
    <div style={{ marginTop: '40px' }}>
      <p style={{
        fontSize: '1em',
        marginBottom: '10px',
        color: '#e8e6d9',
        letterSpacing: '1px'
      }}>AGENT: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>{username}</span></p>
      <div className="room-info">
        <h2 style={{ color: '#d4af37', fontSize: '1.5em', marginBottom: '30px' }}>
          OPERATION: {currentRoom}
        </h2>
        <div className="waiting-area">
          <p style={{
            fontSize: '1.1em',
            color: '#e8e6d9',
            marginBottom: '20px',
            animation: 'pulse 2s infinite'
          }}>⏳ WAITING FOR PLAYERS...</p>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9em', color: '#d4af37', marginBottom: '10px' }}>ACTIVE AGENTS:</p>
            <div className="player-list">
              {players.map((player, index) => (
                <div key={index} className="player-item">
                  👤 {player} {player === username && '(You)'} {index === 0 && '(Host)'}
                </div>
              ))}
            </div>
          </div>
          {isHost && (
            <>
              <button
                onClick={onStartGame}
                className="submit-username-btn"
                style={{ marginTop: '20px', opacity: players.length < 2 ? 0.5 : 1 }}
                disabled={loading || players.length < 2}
              >
                {loading ? 'STARTING...' : 'START GAME'}
              </button>
              {players.length < 2 && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85em', marginTop: '10px' }}>
                  Need at least 2 agents to start mission
                </p>
              )}
            </>
          )}
          {!isHost && (
            <p style={{ color: '#8a8a7a', fontSize: '0.9em', marginTop: '20px' }}>
              Waiting for host to start the game...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom
