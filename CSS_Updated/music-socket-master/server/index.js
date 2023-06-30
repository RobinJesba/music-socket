const express = require("express");
const os = require("os");
const cors = require("cors");
const WebSocket = require("ws");

const app = express();
const port = 8081;

// Enable CORS for all routes
app.use(cors());

// Pass environment variables to the frontend
app.get("/ip", (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  let ipv4Address;
  // Iterate over network interfaces
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    // Iterate over addresses for the current network interface
    networkInterfaces[interfaceName].forEach((address) => {
      if (address.family === "IPv4" && !address.internal) {
        ipv4Address = address.address;
      }
    });
  });
  res.json({ ip: ipv4Address });
});

const server = app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

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

console.log(`WebSocket running on port ${port}`);
