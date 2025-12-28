
from flask import request
from flask_socketio import emit, join_room, leave_room
from rooms import rooms, clear_rooms
from game import Game
from socketio_instance import socketio

# Utility to kick all players from a room
def kick_all_players(room_name, reason='Room was deleted.'):
	if room_name in rooms:
		for sid in list(rooms[room_name]['players'].keys()):
			socketio.emit('kicked', {'message': reason}, room=sid)

@socketio.on('player_left')
def handle_player_left(data):
	room_name = data['room']
	sid = request.sid
	if room_name in rooms and sid in rooms[room_name]['players']:
		del rooms[room_name]['players'][sid]
		# If no players left, delete room
		if not rooms[room_name]['players']:
			del rooms[room_name]

game = Game()

@socketio.on('close_game')
def handle_close_game():
	clear_rooms()
	print('[INFO] All rooms cleared, game closed.')
	socketio.emit('game_closed', {'message': 'Game has been closed. All rooms cleared.'})

@socketio.on('get_rooms')
def handle_get_rooms():
	print(f'[EVENT] get_rooms called by SID {request.sid}')
	available_rooms = []
	for room_name, room_data in rooms.items():
		if not room_data['game_started']:
			available_rooms.append({
				'name': room_name,
				'playerCount': len(room_data['players'])
			})
	emit('rooms_list', {'rooms': available_rooms})
	print(f'Sent rooms list: {available_rooms}')

@socketio.on('start_game')
def handle_start_game(data):
	room_name = data['room']
	if room_name not in rooms:
		emit('error', {'message': 'Room does not exist'})
		return
	room = rooms[room_name]
	if len(room['players']) != 3:
		emit('error', {'message': 'Only 3 players supported for now'})
		return
	# Deal cards
	hands, secret = game.deal_for_three_players()
	# Map player sids to hands
	sids = list(room['players'].keys())
	for i, sid in enumerate(sids):
		# Prepare data: own hand, others as hidden
		player_hand = hands[f'player{i+1}']
		others = [len(hands[f'player{j+1}']) for j in range(3) if j != i]
		socketio.emit('game_started', {
			'yourHand': player_hand,
			'others': others,
			'secret': len(secret)
		}, room=sid)
	room['game_started'] = True

@socketio.on('create_room')
def handle_create_room(data):
	room_name = data['roomName']
	username = data['username']
	print(f"[EVENT] create_room called by SID {request.sid} for room '{room_name}' and user '{username}'")

	if room_name in rooms:
		print(f"[WARN] Room '{room_name}' already exists!")
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

	print(f"[INFO] Room created: {room_name} by {username} (SID: {request.sid})")

@socketio.on('join_room')
def handle_join_room(data):
	room_name = data['roomName']
	username = data['username']
	print(f"[EVENT] join_room called by SID {request.sid} for room '{room_name}' and user '{username}'")

	if room_name not in rooms:
		print(f"[WARN] Room '{room_name}' does not exist!")
		# Attempt to kick all users who were in this room (if we have a record)
		# This only works if we have a way to track previous SIDs for deleted rooms
		# For now, just emit to the current SID
		emit('kicked', {'message': f'Room {room_name} does not exist. You have been removed.'})
		return

	if rooms[room_name]['game_started']:
		print(f"[INFO] {username} is rejoining started game in room '{room_name}' (SID: {request.sid})")
		# Find which player index this SID/username is (by username)
		player_sids = list(rooms[room_name]['players'].keys())
		player_names = list(rooms[room_name]['players'].values())
		try:
			idx = player_names.index(username)
		except ValueError:
			emit('error', {'message': 'Game already started'})
			return
		# Re-deal hands and secret (should match original, but for now re-deal)
		hands, secret = game.deal_for_three_players()
		player_hand = hands[f'player{idx+1}']
		others = [len(hands[f'player{j+1}']) for j in range(3) if j != idx]
		emit('game_started', {
			'yourHand': player_hand,
			'others': others,
			'secret': len(secret)
		})
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
	print(f"[INFO] {username} joined room: {room_name} (SID: {request.sid})")
