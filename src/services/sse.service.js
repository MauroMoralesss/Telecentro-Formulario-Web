// src/services/sse.service.js
const clients = [];

export function registerClient(res) {
  res.writeHead(200, {
    "Content-Type":      "text/event-stream",
    "Cache-Control":     "no-cache",
    Connection:          "keep-alive",
  });
  res.write("event: connected\ndata: conectado\n\n");
  clients.push(res);
  res.once("close", () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
}

export function broadcast(eventName, data) {
  const payload = JSON.stringify(data);
  clients.forEach((res) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${payload}\n\n`);
  });
}
