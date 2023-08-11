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
const appointmentsRoute = require('./Routes/appointments');
const paymentsRoute = require('./Routes/payments');
const messagesRoute = require('./Routes/messages');

app.use('/user', userRoute.route);
app.use('/provider', serviceRoute.route);
app.use('/review',reviewsRoute)
app.use('/appointment',appointmentsRoute);
app.use('/payment',paymentsRoute);
app.use('/message',messagesRoute.route);
app.use('/images', express.static('public/provider/files'));

let senderId, recipientId, message, userType;
io.on('connection', (socket) => {

    socket.on('privateMessage', async (data) => {
        let recipientSocketId = '';
        senderId = data.senderId;
        recipientId = data.recipientId;
        message = data.message;
        userType = data.userType;
        session = data.session;

        console.log(senderId,recipientId);
        if(userType === 'user'){
            console.log(userType);
            recipientSocketId = await userRoute.getUserSocket(recipientId);
        }else{
            console.log(userType);
            recipientSocketId = await serviceRoute.getUserSocket(recipientId);
        }
       
        if (recipientSocketId.length !== 0) {

            io.to(recipientSocketId).emit('privateMessage', { 'message': message, 'messageType': 'received', 'sender': senderId });
            messagesRoute.setMessage(senderId, recipientId, message, 'sent');
            messagesRoute.setMessage(recipientId, senderId, message, 'received');
        } else {
            messagesRoute.setMessage(senderId, recipientId, message, 'sent');
            messagesRoute.setMessage(recipientId, senderId, message, 'received');
        }
    });

    socket.on('disconnect', async () => {
        console.log('a user disconnected!');
    });
});

httpServer.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});