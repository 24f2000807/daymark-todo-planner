import mongoose from 'mongoose';

export default async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGODB_URI is missing. Add it to server/.env.');
  await mongoose.connect(uri);
}
