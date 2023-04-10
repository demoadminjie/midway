import { WebSocketServer, WebSocket } from 'ws';

import * as dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: process.env.MID_WAY_PORT });

wss.on('connection', (ws)=> {
  const serverSocket = new WebSocket(`ws://${process.env.LSTM_SERVER_URL}`);

  serverSocket.addEventListener('open', () => {
    console.log('Connected to server');
  });

  serverSocket.addEventListener('message', (event) => {
    console.log(`Received message from server: ${event.data}`);
    ws.send(event.data);
  });

  serverSocket.addEventListener('close', () => {
    console.log('Disconnected from server');
  });

  ws.on('message', (data) => {
    console.log(`Received message from client: ${data}`);
    serverSocket.send(data);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    serverSocket.close();
  });
});