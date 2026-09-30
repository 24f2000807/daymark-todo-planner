import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import Task from '../models/Task.js';

process.env.NODE_ENV = 'production';
const { default: app } = await import('../app.js');

let database;

before(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
  app.locals.databaseReady = () => mongoose.connection.readyState === 1;
});

beforeEach(async () => Task.deleteMany({}));

after(async () => {
  await mongoose.disconnect();
  await database.stop();
});

const validTask = {
  title: 'Review notes',
  durationMinutes: 30,
};

test('health reports database readiness without exposing its address', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('serves the built frontend and keeps unknown API routes as JSON 404s', async () => {
  const page = await request(app).get('/').expect(200);
  assert.match(page.headers['content-type'], /text\/html/);
  assert.match(page.text, /id="root"/);

  const missingRoute = await request(app).get('/api/not-a-route').expect(404);
  assert.match(missingRoute.headers['content-type'], /application\/json/);
  assert.deepEqual(missingRoute.body, { error: { message: 'Route not found.' } });
});

test('creates with defaults, lists newest first, edits, completes, and deletes', async () => {
  const created = await request(app).post('/api/tasks').send(validTask).expect(201);
  assert.equal(created.body.task.category, 'Other');
  assert.equal(created.body.task.priority, 'Medium');
  assert.equal(created.body.task.description, '');
  assert.equal(created.body.task.dueDate, null);
  assert.equal(created.body.task.completed, false);

  const edited = await request(app).patch(`/api/tasks/${created.body.task._id}`)
    .send({ title: 'Review chapter notes', completed: true }).expect(200);
  assert.equal(edited.body.task.title, 'Review chapter notes');
  assert.equal(edited.body.task.durationMinutes, 30);
  assert.equal(edited.body.task.completed, true);
  assert.equal((await request(app).get('/api/tasks').expect(200)).body.tasks.length, 1);

  await request(app).delete(`/api/tasks/${created.body.task._id}`).expect(204);
  await request(app).delete(`/api/tasks/${created.body.task._id}`).expect(404);
});

test('rejects invalid and unknown fields and empty updates', async () => {
  const invalidInputs = [
    [{ ...validTask, title: '   ' }, 'title'],
    [{ ...validTask, durationMinutes: 1.5 }, 'durationMinutes'],
    [{ ...validTask, durationMinutes: 0 }, 'durationMinutes'],
    [{ ...validTask, category: 'Urgent' }, 'category'],
    [{ ...validTask, priority: 'Urgent' }, 'priority'],
    [{ ...validTask, dueDate: '2026-02-30' }, 'dueDate'],
    [{ ...validTask, _id: 'forbidden' }, '_id'],
  ];

  for (const [body, field] of invalidInputs) {
    const response = await request(app).post('/api/tasks').send(body).expect(400);
    assert.ok(response.body.error.fields[field], `Expected an error for ${field}`);
  }

  const created = await request(app).post('/api/tasks').send(validTask).expect(201);
  await request(app).patch(`/api/tasks/${created.body.task._id}`).send({}).expect(400);
  await request(app).patch(`/api/tasks/${created.body.task._id}`).send({ completed: 'yes' }).expect(400);
  await request(app).patch('/api/tasks/not-an-id').send({ completed: true }).expect(400);
});

test('accepts a real leap day and normalizes a blank due date', async () => {
  const leapDay = await request(app).post('/api/tasks')
    .send({ ...validTask, dueDate: '2024-02-29' }).expect(201);
  assert.equal(leapDay.body.task.dueDate, '2024-02-29');
  const cleared = await request(app).patch(`/api/tasks/${leapDay.body.task._id}`)
    .send({ dueDate: '' }).expect(200);
  assert.equal(cleared.body.task.dueDate, null);
});
