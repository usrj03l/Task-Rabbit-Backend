const express = require('express');
const app = express();
const parser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(parser.json())

mongoose.connect('mongodb://127.0.0.1:27017/taskRabbit');

const userRoute = require('./Routes/users');
const serviceRoute = require('./Routes/serviceProvider');

app.use('/user', userRoute.route);
app.use('/provider', serviceRoute);

app.get('/', (req, res) => {
    res.send('Working');
})

let senderId, recipientId, message, userType, sessionId,session;
const sessionIdToSocketIdMap = new Map();
io.on('connection', (socket) => {

    sessionId = Math.random().toString(36).substring(7);
    socket.sessionId = sessionId
    sessionIdToSocketIdMap.set(sessionId, socket.id);
    socket.emit('handshake', sessionId);

    socket.on('privateMessage', async (data) => {
        // let recipientSocketId = '';
        senderId = data.senderId;
        recipientId = data.recipientId;
        message = data.message;
        userType = data.userType;
        session = data.session

        const recipientSessionId = await userRoute.getUser(recipientId)
        const recipientSocketId = sessionIdToSocketIdMap.get(recipientSessionId);

        console.log(recipientSocketId);
        if (recipientSocketId) {

            io.to(recipientSocketId).emit('privateMessage', `${message}`)
            console.log('emitted and pushing to db');

            userRoute.setMessage(senderId, recipientId, message, 'sent');
            userRoute.setMessage(recipientId, senderId, message, 'received');
        } else {
            console.log('pushing to DB');
            userRoute.setMessage(senderId, recipientId, message, 'sent');
            userRoute.setMessage(recipientId, senderId, message, 'received');
        }
    });

    socket.on('disconnect', async () => {
        sessionIdToSocketIdMap.delete(socket.session);
        console.log('a user disconnected!');
    });
});


httpServer.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});