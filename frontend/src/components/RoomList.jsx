import './RoomList.css'

function RoomList({ rooms, onJoinRoom, onCreateRoom }) {
  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h2>🔍 AVAILABLE OPERATIONS</h2>
      </div>

      {rooms.length === 0 ? (
        <div className="no-rooms">
          <p>No active operations found</p>
          <p style={{ fontSize: '0.9em', color: '#8a8a7a' }}>Create a new operation to begin</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room, index) => (
            <div key={index} className="room-card">
              <div className="room-name">📁 {room.name}</div>
              <div className="room-info">
                <span className="player-count">
                  👤 {room.playerCount} {room.playerCount === 1 ? 'Agent' : 'Agents'}
                </span>
              </div>
              <button
                onClick={() => onJoinRoom(room.name)}
                className="join-btn"
              >
                ENTER
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="create-room-section">
        <button onClick={onCreateRoom} className="create-new-room-btn">
          ➕ CREATE NEW OPERATION
        </button>
      </div>
    </div>
  )
}

export default RoomList
