const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });

const clients = new Set();

// Event handler for new client connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Add the new client to the set
  clients.add(ws);

  // Event handler for receiving messages from the client
  ws.on("message", (message) => {
    console.log("Received message:", JSON.parse(message));

    // Send a response back to the client
    clients.forEach((client) => {
      if (client !== ws) {
        client.send(JSON.stringify(JSON.parse(message)));
      }
    });
  });

  // Event handler for client disconnections
  ws.on("close", () => {
    console.log("Client disconnected");
    // Remove the client from the set
    clients.delete(ws);
  });
});

console.log("WebSocket running on port 8081");
