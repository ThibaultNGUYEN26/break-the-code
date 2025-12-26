import './UsernameForm.css'
import { useRef, useEffect } from 'react'

function UsernameForm({ username, setUsername, onSubmit, autoFocus }) {
  const inputRef = useRef(null)
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])
  return (
    <div style={{ marginTop: '40px' }}>
      <p style={{
        fontSize: '1.2em',
        marginBottom: '30px',
        color: '#d4af37',
        letterSpacing: '1px'
      }}>IDENTIFY YOURSELF, AGENT</p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <input
          ref={inputRef}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your codename..."
          className="username-input"
          maxLength={20}
          required
        />
        <button type="submit" className="submit-username-btn">
          PROCEED
        </button>
      </form>
    </div>
  )
}

export default UsernameForm
