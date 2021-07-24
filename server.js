const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
  fs.readFile(__dirname + "/public/index.html", (err, data) => {
    if (!err) {
      res.writeHead(200);
      res.end(data);
    }
  });
});
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const parsed = JSON.parse(data);
    if (
      !parsed ||
      typeof parsed.action !== "string" ||
      typeof parsed.barcode !== "string"
    ) {
      return;
    }
    const { action, barcode } = parsed;
    if (action == "login") {
      ws.barcode = barcode;
      wss.clients.forEach((client) => {
        if (client !== ws && client.barcode === barcode) {
          client.invalidate();
        }
      });
    }
  });

  ws.invalidate = () => {
    ws.send(
      JSON.stringify({
        action: "invalidate",
        message: "You have logged in using another device.",
      })
    );
    ws.close();
  };
});

server.listen(8080);
