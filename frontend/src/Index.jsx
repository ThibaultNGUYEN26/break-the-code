import './index.css'
import { useState, useEffect, useRef } from 'react'
import RoomList from './components/RoomList'
import UsernameForm from './components/UsernameForm'
import WaitingRoom from './components/WaitingRoom'
import Countdown from './components/Countdown'
import io from 'socket.io-client'

function Index() {
  const [secret, setSecret] = useState(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [roomSelected, setRoomSelected] = useState(false)
  const [username, setUsername] = useState('')
  const [usernameSubmitted, setUsernameSubmitted] = useState(false)
  const [showCreateRoomInput, setShowCreateRoomInput] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomCreated, setRoomCreated] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [currentRoom, setCurrentRoom] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io('http://localhost:5000')

    socketRef.current.on('connected', (data) => {
      console.log(data.message)
      socketRef.current.emit('get_rooms')
    })

    socketRef.current.on('rooms_list', (data) => {
      console.log('Rooms list received:', data.rooms)
      setAvailableRooms(data.rooms)
    })

    socketRef.current.on('room_created_broadcast', (data) => {
      console.log('New room created:', data)
      if (!roomCreated) {
        setAvailableRooms(prev => [...prev, data])
      }
    })

    socketRef.current.on('room_created', (data) => {
      console.log('Room created:', data)
      setRoomCreated(true)
      setCurrentRoom(data.room)
      setPlayers(data.players)
      setIsHost(data.isHost)
      setLoading(false)
    })

    socketRef.current.on('room_joined', (data) => {
      console.log('Room joined:', data)
      setRoomCreated(true)
      setCurrentRoom(data.room)
      setPlayers(data.players)
      setIsHost(data.isHost)
      setLoading(false)
    })

    socketRef.current.on('player_joined', (data) => {
      console.log('Player joined:', data)
      setPlayers(data.players)
      if (typeof data.isHost !== 'undefined') setIsHost(data.isHost)
    })



    socketRef.current.on('player_left', (data) => {
      console.log('Player left:', data)
      setPlayers(data.players)
      if (typeof data.isHost !== 'undefined') setIsHost(data.isHost)
    })

    socketRef.current.on('room_deleted', (data) => {
      console.log('Room deleted:', data)
      // Remove the room from availableRooms
      setAvailableRooms((prev) => prev.filter(r => r.name !== data.room))
      // If user is in the deleted room, reset state
      if (currentRoom === data.room) {
        setRoomCreated(false)
        setRoomSelected(false)
        setShowCreateRoomInput(false)
        setCurrentRoom('')
        setPlayers([])
        setIsHost(false)
        setGameStarted(false)
        setSecret(null)
        setError('Room was deleted (host left or all players left)')
      }
    })

    socketRef.current.on('host_changed', (data) => {
      console.log('Host changed:', data)
      // If this client is the new host, update isHost
      if (username && data.newHost === username) {
        setIsHost(true)
      } else {
        setIsHost(false)
      }
    })

    socketRef.current.on('game_started', (data) => {
      console.log('Game started:', data)
      setGameStarted(true)
      setShowCountdown(true)
      setLoading(false)
      setTimeout(() => {
        setSecret(data.secret)
        setShowCountdown(false)
      }, 3000);
    })

    socketRef.current.on('error', (data) => {
      console.error('Socket error:', data.message)
      setError(data.message)
      setLoading(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const leaveRoomIfNeeded = () => {
      if (socketRef.current && roomCreated && currentRoom) {
        socketRef.current.emit('leave_room', { room: currentRoom });
      }
    };

    const handlePopState = (event) => {
      leaveRoomIfNeeded();
      if (event.state) {
        // Restore state from history
        if (event.state.page === 'username') {
          setUsernameSubmitted(false)
          setRoomSelected(false)
          setShowCreateRoomInput(false)
          setRoomCreated(false)
        } else if (event.state.page === 'roomList') {
          setRoomSelected(false)
          setShowCreateRoomInput(false)
          setRoomCreated(false)
        } else if (event.state.page === 'createRoom') {
          setShowCreateRoomInput(true)
          setRoomCreated(false)
        }
      }
    };

    const handleBeforeUnload = (e) => {
      leaveRoomIfNeeded();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Push initial state
    window.history.replaceState({ page: 'username' }, '');

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomCreated, currentRoom]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setUsernameSubmitted(true)
      window.history.pushState({ page: 'roomList' }, '')
    }
  }

  const handleCreateRoomClick = () => {
    setRoomSelected(true)
    setShowCreateRoomInput(true)
    window.history.pushState({ page: 'createRoom' }, '')
  }

  const handleJoinExistingRoom = (roomName) => {
    setRoomName(roomName)
    setRoomSelected(true)
    setLoading(true)
    if (socketRef.current) {
      socketRef.current.emit('join_room', {
        roomName: roomName,
        username: username
      })
    }
  }

  const handleRoomNameSubmit = (e) => {
    e.preventDefault()
    if (roomName.trim() && socketRef.current) {
      setLoading(true)
      socketRef.current.emit('create_room', {
        roomName: roomName,
        username: username
      })
    }
  }

  const handleStartGame = () => {
    if (socketRef.current && isHost && players.length >= 2) {
      setLoading(true)
      socketRef.current.emit('start_game', {
        room: currentRoom
      })
    }
  }

  return (
    <div className="investigation-container">
      <div className="case-file">
        <h1>🔍 Break The Code</h1>
        <div className="classified-stamp">CLASSIFIED</div>

        {!usernameSubmitted && (
          <UsernameForm
            username={username}
            setUsername={setUsername}
            onSubmit={handleUsernameSubmit}
            autoFocus
          />
        )}

        {usernameSubmitted && !roomSelected && (
          <div style={{ marginTop: '40px' }}>
            <p style={{
              fontSize: '1em',
              marginBottom: '20px',
              color: '#e8e6d9',
              letterSpacing: '1px'
            }}>AGENT: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>{username}</span></p>
            <RoomList
              rooms={availableRooms}
              onJoinRoom={handleJoinExistingRoom}
              onCreateRoom={handleCreateRoomClick}
            />
          </div>
        )}

        {showCreateRoomInput && !roomCreated && (
          <div style={{ marginTop: '40px' }}>
            <p style={{
              fontSize: '1em',
              marginBottom: '10px',
              color: '#e8e6d9',
              letterSpacing: '1px'
            }}>AGENT: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>{username}</span></p>
            <p style={{
              fontSize: '1.2em',
              marginBottom: '30px',
              color: '#d4af37',
              letterSpacing: '1px'
            }}>NAME YOUR OPERATION</p>
            <form onSubmit={handleRoomNameSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="username-input"
                maxLength={30}
                required
                autoFocus
              />
              <button type="submit" className="submit-username-btn" disabled={loading}>
                {loading ? 'CREATING...' : 'CREATE ROOM'}
              </button>
            </form>
          </div>
        )}

        {roomCreated && !gameStarted && (
          <WaitingRoom
            currentRoom={currentRoom}
            username={username}
            players={players}
            isHost={isHost}
            loading={loading}
            onStartGame={handleStartGame}
            onLeaveRoom={() => {
              if (socketRef.current && currentRoom) {
                setLoading(true);
                socketRef.current.emit('leave_room', { room: currentRoom });
                setRoomCreated(false);
                setRoomSelected(false);
                setShowCreateRoomInput(false);
                setCurrentRoom('');
                setPlayers([]);
                setIsHost(false);
                setGameStarted(false);
                setSecret(null);
                setError(null);
              }
            }}
          />
        )}

        {loading && !roomCreated && (
          <p style={{
            fontSize: '1.2em',
            animation: 'pulse 1.5s infinite',
            color: '#d4af37'
          }}>DECODING...</p>
        )}
        {error && (
          <p style={{
            color: '#ff4444',
            fontSize: '1.1em',
            padding: '10px',
            border: '2px solid #ff4444',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 68, 68, 0.1)'
          }}>⚠ ERROR: {error}</p>
        )}
        {showCountdown && (
          <Countdown />
        )}
        {secret && !showCountdown && (
          <div className="secret-reveal">
            <h2>🔐 SECRET CODE REVEALED</h2>
            <div className="code-display">
              {secret.map((digit, index) => (
                <span key={index} className="code-digit">{digit}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Index
