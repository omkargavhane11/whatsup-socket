const dotenv = require("dotenv");
dotenv.config();


const io = require("socket.io")(process.env.PORT, {
    cors: {
        origin: process.env.CLIENT
    }
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.userId !== socketId);
}

const getUser = (userId) => {
    let user = users.find(user => user.userId === userId);
    return user;
}

io.on("connection", (socket) => {
    console.log(`User connected with ${socket.id}`);

    // 
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    })

    // 
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", users);
    })

    // 
    socket.on("sendMessage", ({ senderId, recieverId, message, chatId }) => {
        const user = getUser(recieverId);

        io.to(user?.socketId).emit("getMessage", {
            senderId, message, chatId
        })
    })

})

