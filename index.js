const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const path = require('path')
const fs = require('fs')
const WebSocket = require('ws')

const port = '9002'
const app = express()
app.use(bodyParser.json({limit: '100mb'}), cors())
app.disable('etag')

const server = http.createServer()
server.on('request', app)
const wss = new WebSocket.Server({
  server: server
})


let clients = []
let requests = []

wss.on('connection', function connection(client) {

  client.on('close', function close(code, reason) {
    let index = clients.indexOf(client)
    if (index > -1) {
      clients.splice(index, 1)
    }

    console.log(`Client closed, total active clients ${clients.length}`)
  })

  clients.push(client)
  console.log(`Client connected, total active clients ${clients.length}`)
  
  client.send(JSON.stringify(requests))

  client.on('message', function message(data) {
    let message = `${data}`

    if (message == 'heatbeat') {
      client.heatbeat = new Date()
    } else if (message == 'restartLiveStream') {
      restartLiveStream()
    }
  })
})

// on(event: "close" | "listening", cb: (this: Server<T>) => void): this;

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', function (req, res) {
  fs.readFile(__dirname + '/public/index.html', 'utf8', (err, text) => {
    res.send(text)
  })
})

server.listen(port, () => {
  console.log(`webhook app started on port ${port}`)
})
