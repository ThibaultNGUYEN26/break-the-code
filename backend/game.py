import random

class Game:
    def __init__(self):
        self.score = 0
        # 0-9 black, 0-9 white except 5 is orange
        self.cards = [
            {'number': n, 'color': 'black'} for n in range(10)
        ] + [
            {'number': n, 'color': 'white'} for n in range(10) if n != 5
        ] + [
            {'number': 5, 'color': 'orange'}
        ]

    def deal_for_three_players(self):
        # 3 players: 5 cards each, 5 secret, all unique
        deck = self.cards.copy()
        random.shuffle(deck)
        players = {f'player{i+1}': [] for i in range(3)}
        for p in players:
            for _ in range(5):
                card = deck.pop()
                players[p].append(card)
        secret = [deck.pop() for _ in range(5)]
        # Sort all hands and secret by number ascending
        for p in players:
            players[p].sort(key=lambda card: card['number'])
        secret.sort(key=lambda card: card['number'])
        print('[DEBUG] Secret cards:', secret)
        return players, secret

    def play(self):
        players, secret = self.deal_for_three_players()
        print('Players:', players)
        print('Secret:', secret)
