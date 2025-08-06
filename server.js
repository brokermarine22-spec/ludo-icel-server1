const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*"
  }
});

let players = {};
let turn = 0;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (name) => {
    if (Object.keys(players).length >= 4) {
      socket.emit('full');
      return;
    }
    players[socket.id] = { name, position: 0 };
    io.emit('players', players);
  });

  socket.on('roll', () => {
    if (Object.keys(players)[turn] === socket.id) {
      const dice = Math.floor(Math.random() * 6) + 1;
      players[socket.id].position += dice;
      turn = (turn + 1) % Object.keys(players).length;
      io.emit('update', { players, turn });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    io.emit('players', players);
    if (turn >= Object.keys(players).length) {
      turn = 0;
    }
  });
});

app.get('/', (req, res) => {
  res.send('Ludo Icel server is running.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
