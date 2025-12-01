const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  // Store active connections
  const activeConnections = new Map() // userId -> socketId
  const pendingCalls = new Map() // callId -> call data

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    const userType = socket.handshake.query.type || 'user'

    console.log(`User connected: ${userId} (${userType})`)

    if (userId) {
      activeConnections.set(userId, socket.id)
    }

    // Handle call initiation
    socket.on('initiate-call', ({ to, from, fromName }) => {
      console.log(`Call initiated: ${from} -> ${to}`)
      
      const callId = `${from}-${to}-${Date.now()}`
      pendingCalls.set(callId, { from, to, fromName, callId })

      // Check if receiver is online
      const receiverSocketId = activeConnections.get(to)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', {
          from,
          fromName,
          callId
        })
      } else {
        // Receiver not online
        socket.emit('call-rejected', { reason: 'User not available' })
      }
    })

    // Handle call acceptance
    socket.on('accept-call', ({ to, from }) => {
      console.log(`Call accepted: ${from} -> ${to}`)
      const callerSocketId = activeConnections.get(to)
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', { from })
      }
    })

    // Handle call rejection
    socket.on('reject-call', ({ to }) => {
      console.log(`Call rejected: ${to}`)
      const callerSocketId = activeConnections.get(to)
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-rejected')
      }
    })

    // Handle WebRTC offer
    socket.on('offer', ({ to, offer }) => {
      console.log(`Offer sent: ${to}`)
      const receiverSocketId = activeConnections.get(to)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('offer', { offer, from: socket.handshake.query.userId })
      }
    })

    // Handle WebRTC answer
    socket.on('answer', ({ to, answer }) => {
      console.log(`Answer sent: ${to}`)
      const callerSocketId = activeConnections.get(to)
      if (callerSocketId) {
        io.to(callerSocketId).emit('answer', { answer, from: socket.handshake.query.userId })
      }
    })

    // Handle ICE candidates
    socket.on('ice-candidate', ({ to, candidate }) => {
      const targetSocketId = activeConnections.get(to)
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', { 
          candidate, 
          from: socket.handshake.query.userId 
        })
      }
    })

    // Handle call end
    socket.on('end-call', ({ to }) => {
      console.log(`Call ended: ${to}`)
      const targetSocketId = activeConnections.get(to)
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended')
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`)
      if (userId) {
        activeConnections.delete(userId)
      }
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})


