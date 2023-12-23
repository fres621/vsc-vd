import { WebSocketServer } from 'ws';
import { promises as fs } from "fs";
import path from "path";
import transpile from './transpile';
import { networkInterfaces } from 'os';
import build from './build';

var stdin = process.stdin;

const filePath = "./workspace/index.tsx";

let logFolder = "logs";
fs.mkdir(logFolder).catch(_=>{});

function generateLogFileName() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return path.join(logFolder, `log-${timestamp}.log`);
}

let filename = generateLogFileName();

const wss = new WebSocketServer({ port: 3000, clientTracking: true });

console.log(`WS: ${Object.values(networkInterfaces()).flat().find(ip => ip.internal === false && ip.family === 'IPv4').address}:3000`);

wss.on('connection', function connection(ws) {
    console.log(`+ > Websocket connected, connections: ${wss.clients.size}`);
    ws.on('close', () => {
      console.log(`- > Websocket disconnected, connections: ${wss.clients.size}`);
    })
    ws.on('message', (data) => {
      let object = JSON.parse(data.toString());
      console.log(object.message);
      fs.appendFile(filename, object.message+"\n");
    });

  });


stdin.setRawMode(true);
stdin.setEncoding('utf8');
stdin.on( 'data', async function( key: string ){
  if (key === '\u0003') return process.exit();
  if (key === '\u000C') {
    console.clear();
    console.log(`= > There are currently ${wss.clients.size} connected clients...`);
  };

  if (key === '\r') {
    const transpiled = await build(filePath);
    //const transpiled = transpile((await fs.readFile(filePath)).toString());
    console.log(`= > Sending to ${wss.clients.size} clients...`);
    wss.clients.forEach(client=>client.send(transpiled));
  };

  if (key === 'r') {
    const transpiled = await build(filePath);
    //const transpiled = transpile((await fs.readFile(filePath)).toString());
    console.log(`= > Transpiled code:`);
    console.log(transpiled);
  };
  
  if (key === 'l') {
    filename = generateLogFileName();
    console.log("= > Generated new log file");
  }

});
