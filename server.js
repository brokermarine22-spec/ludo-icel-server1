const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {};

io.on("connection", (socket) => {
    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        if (!rooms[roomName]) rooms[roomName] = [];
        if (rooms[roomName].length >= 4) return;
        const colors = ["Red", "Green", "Yellow", "Blue"];
        const assigned = colors[rooms[roomName].length];
        rooms[roomName].push({ id: socket.id, color: assigned });
        socket.emit("assignedColor", assigned);
    });

    socket.on("rollDice", (roomName) => {
        const value = Math.ceil(Math.random() * 6);
        const player = rooms[roomName]?.find(p => p.id === socket.id)?.color;
        io.to(roomName).emit("diceRolled", { player, value });
    });

    socket.on("chatMessage", ({ room, message }) => {
        const player = rooms[room]?.find(p => p.id === socket.id)?.color || "Unknown";
        io.to(room).emit("chatMessage", { player, message });
    });

    socket.on("disconnect", () => {
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(p => p.id !== socket.id);
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
