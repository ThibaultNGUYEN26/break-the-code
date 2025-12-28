from flask import Blueprint, jsonify
from game import Game

game = Game()

api_bp = Blueprint('api', __name__)

@api_bp.route('/api/secret', methods=['GET'])
def get_secret():
    secret = game.secret_code()
    return jsonify({'secret': secret})
