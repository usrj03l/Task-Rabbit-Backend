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
const reviewsRoute = require('./Routes/reviews');

app.use('/user', userRoute.route);
app.use('/provider', serviceRoute);
app.use('/review',reviewsRoute)
app.use('/images', express.static('public/provider/files'));

app.get('/', (req, res) => {
    res.send('Working');
})

let senderId, recipientId, message, userType, session;
io.on('connection', (socket) => {

    socket.on('privateMessage', async (data) => {
        let recipientSocketId = '';
        senderId = data.senderId;
        recipientId = data.recipientId;
        message = data.message;
        userType = data.userType;
        session = data.session

        recipientSocketId = await userRoute.getUserS(recipientId)

        if (recipientSocketId.length !== 0) {

            io.to(recipientSocketId).emit('privateMessage', { 'message': message, 'messageType': 'received', 'sender': senderId });
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
        console.log('a user disconnected!');
    });
});


httpServer.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});