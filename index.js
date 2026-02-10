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
let response = {
  status: 200,
  body: '{}'
}

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
  
  client.send(JSON.stringify({data: requests, response: response}))

  client.on('message', function message(data) {
    let message = JSON.parse(data)

    if (message.op == 'clearRequests') {
      requests = []
    } else if (message.op == 'saveResponse') {
      response = message.response
    }
  })
})

app.all('/hook', (req, res, next) => {
  let request = {
    timestamp: new Date(),
    ip: req.ip,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
  }

  let forwardedFor = req.get('x-forwarded-for');
  if (forwardedFor != undefined) {
    request.ip = forwardedFor.split(',')[0]
  }

  requests.unshift(request)

  clients.map(c => c.send(JSON.stringify({data: [request]})))

  res.status(response.status).json(JSON.parse(response.body))
})

app.use(express.static(path.join(__dirname, 'public')))

server.listen(port, () => {
  console.log(`webhook app started on port ${port}`)
})
