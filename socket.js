let io;
module.exports = {
    init: (server) => {
        io = require('socket.io')(server, {
            cors: {
                origin: '*'
            }
        });
        //{'transports': ['websocket']}

        let count = 0;
        //socket connection log
        io.on('connection', async (socket) => {
            count += 1;
            console.log("Room Active", count);
            io.emit("init", { success: true });
            socket.on('join_room', (data) => {
                const { roomId, } = data; // Data sent from client when join_room event emitted
                console.log("inside the data we have here roomId", join_room);
                socket.join(roomId); // Join the user to a socket room
            });
            socket.on('disconnect', () => {
                count -= 1;
                console.log("Room Deactive: ", count);
            });
            socket.on('connect_failed', function (error) {
                console.log('Connection Failed', error);
            });
        });
        return io;
    },
    getio: () => {
        if (!io) {
            throw new Error("socket not initialised");
        }
        return io;
    }
}



