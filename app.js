let express = require("express");
let app = express();
let readline = require("readline");
let mongoose = require("mongoose");
let url = "mongodb://localhost:27017/chatting-app";
let r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// to import style.css
app.use(express.static("assets"));
app.use(express.json());

let http = require("http").createServer(app);
let io = require("socket.io")(http);
mongoose.pluralize(null);

// create the schema reference
let chatsSchema = mongoose.Schema({
  _id: Number,
  chat: [{ sender: String, msg: String }],
});

// create reference of the model
let chatsModel = mongoose.model("Chats", chatsSchema);
// database connectivity
mongoose
  .connect(url)
  .then((res) => console.log("Mongoose Connected Successfully"))
  .catch((err) => console.log(err));

// array to save chat temporary
let chatArray = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/chat.html");
});
app.post("/chat", (req, res) => {
  let id = randomId();
  // insert data into MongoDB
  chatsModel.insertMany({ _id: id, chat: chatArray }, (err, result) => {
    if (!err) {
      chatArray = [];
      getChatById(id, res);
    } else {
      console.log(err);
      res.send("Record didn't store");
    }
  });
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("Client", (msg) => {
    //send message to client application
    io.emit("Client", msg); //forward message from client to webapp screen
    chatArray.push({ sender: "Client", msg: msg });
    console.log("From Client: " + msg);
  });

  r1.on("line", (input) => {
    //send message from server
    socket.emit("Server", input);
    chatArray.push({ sender: "Server", msg: input });
  });
});
let randomId = function () {
  return Math.floor(Math.random() * 100);
};
// retreive chats from MongoDB
let getChatById = (cId, res) => {
  chatsModel.findById({ _id: cId }, (err, doc) => {
    if (!err) {
      if (doc != null) {
        res.json(doc.chat);
      } else {
        res.json({ message: "Recored not present" });
      }
    } else {
      console.log({ msg: err });
    }
  });
};
// run thhe application using http reference
// http://localhost:9090/
http.listen(9090, () => console.log("Server is runing on port number 9090"));
