const express = require('express');
const http = require('http');
const app = express();
app.use(express.json());
const server = http.createServer(app);
require('./socket').init(server);

// let userArray = [{
//     name: "Jitesh",
//     email: "jitesh865@gmail.com"
// },
// {
//     name: "Ravi",
//     email: "ravi@gmail.com"
// }]
var mongoose = require('mongoose');
const User = require('./models/User');
const { getChatMessages, sendMessagesFromMySide, userChatList } = require('./myController');
// const { getChatMessages, sendMessagesFromMySide, userChatList } = require('./controllers/myController');
mongoose
    .connect('mongodb://localhost:27017/chat', {})
    .then(async () => {
        console.log('Successfully connected to the database');
        // await User.create(userArray[1])
    })
    .catch((err) => {
        console.log('Could not connect to the database.', err);
        process.exit();
    });


app.get('/', (req, res) => {
    res.send('Welcome to the chat API!');
});

app.get('/chatRoom', getChatMessages);
app.post('/sendMessage', sendMessagesFromMySide);
app.get('/chatList', userChatList);
server.listen(3000, () => {
    console.log('Server listening on :3000');
});