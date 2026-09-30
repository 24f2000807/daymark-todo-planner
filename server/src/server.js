import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import app from './app.js';
import connectDatabase from './config/db.js';

const port = Number(process.env.PORT) || 5000;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
const dnsServers = process.env.DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);

if (dnsServers?.length) dns.setServers(dnsServers);

try {
  await connectDatabase(process.env.MONGODB_URI);
  app.locals.databaseReady = () => mongoose.connection.readyState === 1;
  app.listen(port, host, () => console.log(`Planner API listening on http://${host}:${port}`));
} catch (error) {
  console.error(`Could not connect to MongoDB: ${error.message}`);
  process.exitCode = 1;
}
