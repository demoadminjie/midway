import { WebSocketServer, WebSocket } from 'ws';

import * as dotenv from 'dotenv';
dotenv.config();

const epoch_regex = /Epoch (\d+): loss = \d+\.\d+/;

const wss = new WebSocketServer({ port: process.env.MID_WAY_PORT });

const serverSockets = new Map();

wss.on('connection', async (ws, upgradeReq)=> {

  let socketId;
  try {
    const url = new URL(`ws://localhost:${process.env.MID_WAY_PORT}${upgradeReq.url}`);
    socketId = url.searchParams.get('socketId');
  } catch (error) {
    console.error('WebSocket连接请求URL无效', upgradeReq.url, error);
    socket.close();
    return;
  }

  const createWebStocket = async () => {

    const serverSocket = new WebSocket(`ws://${process.env.LSTM_SERVER_URL}`)
  
    return new Promise((resolve, reject) => {
      serverSocket.onopen = () => {
        console.log('Connected to server');
        ws.send('established');
        resolve(serverSocket);
      };
  
      serverSocket.onerror = (error) => {
        reject(error);
      };
    });
  }

  const hasSocket = serverSockets.has(socketId);

  const serverSocket = hasSocket ? serverSockets.get(socketId) : await createWebStocket(ws);

  (!hasSocket) && (serverSockets.set(socketId, serverSocket));

  const onMessage = (event) => {
    const { data } = event;
    console.log(`Received message from server: ${data}`);
    ws.send(data);

    const epochMatch = data.match(epoch_regex);

    if (epochMatch) {
      const epoch = parseInt(epochMatch[1]);
      // if (epoch === 999) {
      //   ws.close();
      // }
    // } else if (data.includes('Predicted')) {
    //   ws.close();
    }
    if (data.includes('Predicted')) {
      ws.close();
    }
  }

  serverSocket.addEventListener('message', onMessage);

  serverSocket.addEventListener('close', () => {
    console.log('Disconnected from server');
  });

  ws.on('message', (data) => {
    console.log(`Received message from client: ${data}`);
    serverSocket.send(data);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    serverSocket.removeEventListener('message', onMessage);
  });
});
