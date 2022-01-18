// chat application and connect it with a database so that the users can download or store the chat log.
let express = require("express")
let app = express();
let readline = require("readline");
let r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// to import style.css
app.use(express.static('assets'));

let http = require("http").createServer(app)
let io = require("socket.io")(http);

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})
app.get("/chat",(req,res)=>{
    res.sendFile(__dirname+"/chat.html")
})

io.on("connection", (socket)=>{
    socket.on('disconnect',()=>{
        console.log("Client disconnected")
    })
    socket.on('Client', (msg)=>{
        //send message to client application
        io.emit('Client', msg) //forward message from client to webapp screen
        // chatArray.push({sender: "Client", message: msg})
        console.log("From Client: "+msg)
    })

    r1.on("line", (input) => {  //send message from server     
        socket.emit('Server', input)
        // chatArray.push({sender: "Server", message: input})
      }); 
})

// run thhe application using http refrence
http.listen(9090, ()=>console.log("Server is runing on port number 9090"))
