import './RoomButton.css'

function RoomButton({ onClick, type, disabled }) {
  return (
    <button
      className={`room-button ${type}`}
      onClick={onClick}
      disabled={disabled}
    >
      {type === 'create' ? 'Create Room' : 'Join Room'}
    </button>
  )
}

export default RoomButton
