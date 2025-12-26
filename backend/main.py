
import random
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store rooms and their players
rooms = {}

class Game:
    def __init__(self):
        self.score = 0
        self.digits = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9]

    def secret_code(self):
        available = self.digits.copy()
        random.shuffle(available)
        code = available[:4]
        return code

    def play(self):
        print(self.secret_code())

game = Game()

@socketio.on('leave_room')
def handle_leave_room(data):
    room_name = data.get('room')
    if not room_name or room_name not in rooms:
        return
    room_data = rooms[room_name]
    if request.sid in room_data['players']:
        username = room_data['players'].pop(request.sid)
        # If host left
        if request.sid == room_data['host']:
            if len(room_data['players']) == 0:
                rooms.pop(room_name, None)
                print(f'Room {room_name} deleted (host left, room empty)')
                socketio.emit('room_deleted', {'room': room_name})
            else:
                new_host_sid = next(iter(room_data['players']))
                room_data['host'] = new_host_sid
                socketio.emit('host_changed', {
                    'room': room_name,
                    'newHost': room_data['players'][new_host_sid]
                }, room=room_name)
                print(f'Host left {room_name}, new host: {room_data['players'][new_host_sid]}')
        else:
            if len(room_data['players']) == 0:
                rooms.pop(room_name, None)
                print(f'Room {room_name} deleted (last player left)')
                socketio.emit('room_deleted', {'room': room_name})
        # Notify all players in the room, and tell each if they are host
        for sid in room_data['players']:
            socketio.emit('player_left', {
                'room': room_name,
                'players': list(room_data['players'].values()),
                'isHost': sid == room_data['host']
            }, room=sid)
        leave_room(room_name)
        print(f'{username} left room: {room_name}')

@app.route('/api/secret', methods=['GET'])
def get_secret():
    secret = game.secret_code()
    return jsonify({'secret': secret})

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to server'})

@socketio.on('get_rooms')
def handle_get_rooms():
    available_rooms = []
    for room_name, room_data in rooms.items():
        if not room_data['game_started']:
            available_rooms.append({
                'name': room_name,
                'playerCount': len(room_data['players'])
            })
    emit('rooms_list', {'rooms': available_rooms})
    print(f'Sent rooms list: {available_rooms}')

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    # Remove player from any room they were in
    for room_name, room_data in list(rooms.items()):
        if request.sid in room_data['players']:
            username = room_data['players'].pop(request.sid)
            # If host left
            if request.sid == room_data['host']:
                if len(room_data['players']) == 0:
                    # Room is now empty, delete it
                    rooms.pop(room_name, None)
                    print(f'Room {room_name} deleted (host left, room empty)')
                else:
                    # Transfer host to next player
                    new_host_sid = next(iter(room_data['players']))
                    room_data['host'] = new_host_sid
                    socketio.emit('host_changed', {
                        'room': room_name,
                        'newHost': room_data['players'][new_host_sid]
                    }, room=room_name)
                    print(f'Host left {room_name}, new host: {room_data['players'][new_host_sid]}')
            else:
                # Not host, just remove player
                if len(room_data['players']) == 0:
                    rooms.pop(room_name, None)
                    print(f'Room {room_name} deleted (last player left)')
            # Notify all players in the room, and tell each if they are host
            for sid in room_data['players']:
                socketio.emit('player_left', {
                    'room': room_name,
                    'players': list(room_data['players'].values()),
                    'isHost': sid == room_data['host']
                }, room=sid)
            break

@socketio.on('create_room')
def handle_create_room(data):
    room_name = data['roomName']
    username = data['username']

    if room_name in rooms:
        emit('error', {'message': 'Room already exists'})
        return

    rooms[room_name] = {
        'players': {request.sid: username},
        'host': request.sid,
        'game_started': False
    }

    join_room(room_name)
    emit('room_created', {
        'room': room_name,
        'players': [username],
        'isHost': True
    })

    # Broadcast updated room list to all connected clients
    socketio.emit('room_created_broadcast', {
        'name': room_name,
        'playerCount': 1
    })

    print(f'Room created: {room_name} by {username}')

@socketio.on('join_room')
def handle_join_room(data):
    room_name = data['roomName']
    username = data['username']

    if room_name not in rooms:
        emit('error', {'message': 'Room does not exist'})
        return

    if rooms[room_name]['game_started']:
        emit('error', {'message': 'Game already started'})
        return

    rooms[room_name]['players'][request.sid] = username
    join_room(room_name)

    players_list = list(rooms[room_name]['players'].values())


    # Notify all players in the room, and tell each if they are host
    for sid in rooms[room_name]['players']:
        socketio.emit('player_joined', {
            'room': room_name,
            'players': players_list,
            'newPlayer': username,
            'isHost': sid == rooms[room_name]['host']
        }, room=sid)

    # Send confirmation to the joining player
    emit('room_joined', {
        'room': room_name,
        'players': players_list,
        'isHost': request.sid == rooms[room_name]['host']
    })

    print(f'{username} joined room: {room_name}')

@socketio.on('start_game')
def handle_start_game(data):
    room_name = data['room']

    if room_name not in rooms:
        emit('error', {'message': 'Room does not exist'})
        return

    if request.sid != rooms[room_name]['host']:
        emit('error', {'message': 'Only host can start the game'})
        return

    rooms[room_name]['game_started'] = True
    secret = game.secret_code()

    # Notify all players that game is starting
    socketio.emit('game_started', {
        'room': room_name,
        'secret': secret
    }, room=room_name)

    print(f'Game started in room: {room_name}')

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
