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

    if (message == 'clearRequests') {
      requests = []
    }
  })
})

app.all('/hook', (req, res, next) => {
  // console.log('Accessing the secret section...' + req.method)
  // console.log(req.ip)

  let request = {
    timestamp: new Date(),
    ip: req.ip,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
  }

  requests.unshift(request)

  clients.map(c => c.send(JSON.stringify([request])))

  res.status(200).json({})
})

app.use(express.static(path.join(__dirname, 'public')))

server.listen(port, () => {
  console.log(`webhook app started on port ${port}`)
})
