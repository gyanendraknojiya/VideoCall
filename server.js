const express = require('express');
const cors = require('cors');

var app = express();

app.use(cors());
const httpServer = require('http').createServer(app);

const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
    methods: 'GET,POST',
  },
});

io.on('connection', (socket) => {
  socket.emit('userID', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', (data) => {
    io.to(data.to).emit('userCalling', data);
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data);
  });

  socket.on('rejectCall', ({ to, from }) => {
    console.log(from);
    io.to(to).emit('callRejected', { to, from });
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log('Server is running at port ' + PORT));
