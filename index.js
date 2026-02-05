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

  console.log('client connected')

  client.heatbeat = new Date()
  clients.push(client)
  
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

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', function (req, res) {
  fs.readFile(__dirname + '/public/index.html', 'utf8', (err, text) => {
    res.send(text)
  })
})

app.listen(port, () => {
  console.log(`webhook app started on port ${port}`)
})
