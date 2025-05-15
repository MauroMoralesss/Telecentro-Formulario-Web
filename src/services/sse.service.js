// src/services/sse.service.js

const clients = []

export function registerClient(req, res) {
  // Preserve CORS (already set by app.use(cors(...)))
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  // Make sure headers actually go out
  if (res.flushHeaders) {
    res.flushHeaders()
  } else {
    // fallback for older Node versions
    res.writeHead(200)
  }

  // Send an initial “connected” event
  res.write("event: connected\ndata: conectado\n\n")

  // Keep track of this client
  clients.push(res)

  // When the client disconnects, remove it
  req.on("close", () => {
    const idx = clients.indexOf(res)
    if (idx !== -1) clients.splice(idx, 1)
  })
}

export function broadcast(eventName, data) {
  const payload = JSON.stringify(data)
  for (const res of clients) {
    res.write(`event: ${eventName}\n`)
    res.write(`data: ${payload}\n\n`)
  }
}
