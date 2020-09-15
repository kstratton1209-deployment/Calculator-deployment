const express = require("express");
const app = express();

const server = app.listen(8000, () => console.log("The server is working on port 8000"));

const io = require("socket.io")(server);


io.on("connection", socket => {
    
    io.emit("welcome",{msg: "hi there, from the server!"})

    socket.on("equation",data => {
        console.log(data);
        socket.broadcast.emit("updateCalcsList",data);
    });
})