import mongoose from 'mongoose';
import Task, { isValidDateOnly } from '../models/Task.js';

const CATEGORIES = ['Personal', 'Work', 'Study', 'Shopping', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const CREATE_FIELDS = ['title', 'description', 'category', 'priority', 'durationMinutes', 'dueDate'];
const UPDATE_FIELDS = [...CREATE_FIELDS, 'completed'];

class RequestError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.status = 400;
    this.fields = fields;
  }
}

function checkObject(body, allowedFields) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new RequestError('Please send task details as a JSON object.');
  }
  const unknown = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unknown.length) {
    throw new RequestError('Some task fields are not allowed.', Object.fromEntries(unknown.map((field) => [field, 'This field cannot be changed.'])));
  }
  if (!Object.keys(body).length) throw new RequestError('Add at least one task field to update.');
}

function validateAndNormalize(body, { creating = false } = {}) {
  const values = { ...body };
  const fields = {};

  if (creating || Object.hasOwn(values, 'title')) {
    if (typeof values.title !== 'string' || !values.title.trim()) fields.title = 'Title is required.';
    else if (values.title.trim().length > 120) fields.title = 'Title must be 120 characters or fewer.';
    else values.title = values.title.trim();
  }
  if (Object.hasOwn(values, 'description')) {
    if (typeof values.description !== 'string') fields.description = 'Description must be text.';
    else if (values.description.length > 2000) fields.description = 'Description must be 2,000 characters or fewer.';
  }
  if (Object.hasOwn(values, 'category') && !CATEGORIES.includes(values.category)) {
    fields.category = `Choose one of: ${CATEGORIES.join(', ')}.`;
  }
  if (Object.hasOwn(values, 'priority') && !PRIORITIES.includes(values.priority)) {
    fields.priority = `Choose one of: ${PRIORITIES.join(', ')}.`;
  }
  if (creating || Object.hasOwn(values, 'durationMinutes')) {
    if (typeof values.durationMinutes !== 'number' || !Number.isSafeInteger(values.durationMinutes) || values.durationMinutes <= 0) {
      fields.durationMinutes = 'Estimated duration must be a positive whole number of minutes.';
    }
  }
  if (Object.hasOwn(values, 'dueDate')) {
    if (typeof values.dueDate === 'string' && !values.dueDate.trim()) values.dueDate = null;
    if (values.dueDate !== null && !isValidDateOnly(values.dueDate)) fields.dueDate = 'Due date must be a real date in YYYY-MM-DD format.';
  }
  if (Object.hasOwn(values, 'completed') && typeof values.completed !== 'boolean') {
    fields.completed = 'Completion status must be true or false.';
  }
  if (Object.keys(fields).length) throw new RequestError('Please correct the task details.', fields);
  return values;
}

function isValidTaskId(id) {
  return /^[a-f\d]{24}$/i.test(id) && mongoose.isValidObjectId(id);
}

function checkTaskId(id) {
  if (!isValidTaskId(id)) throw new RequestError('Task ID is not valid.');
}

function handleMongooseValidation(error) {
  if (error instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(Object.entries(error.errors).map(([name, issue]) => [name, issue.message]));
    return new RequestError('Please correct the task details.', fields);
  }
  if (error instanceof mongoose.Error.CastError) return new RequestError('One or more task fields have an invalid value.');
  return error;
}

export async function listTasks(_request, response) {
  const tasks = await Task.find().sort({ createdAt: -1, _id: -1 });
  response.json({ tasks });
}

export async function createTask(request, response, next) {
  try {
    checkObject(request.body, CREATE_FIELDS);
    const values = validateAndNormalize(request.body, { creating: true });
    const task = await Task.create(values);
    response.status(201).json({ task });
  } catch (error) {
    next(handleMongooseValidation(error));
  }
}

export async function updateTask(request, response, next) {
  try {
    checkTaskId(request.params.id);
    checkObject(request.body, UPDATE_FIELDS);
    const values = validateAndNormalize(request.body);
    const task = await Task.findById(request.params.id);
    if (!task) return response.status(404).json({ error: { message: 'Task not found.' } });
    Object.assign(task, values);
    await task.save();
    return response.json({ task });
  } catch (error) {
    return next(handleMongooseValidation(error));
  }
}

export async function removeTask(request, response, next) {
  try {
    checkTaskId(request.params.id);
    const task = await Task.findByIdAndDelete(request.params.id);
    if (!task) return response.status(404).json({ error: { message: 'Task not found.' } });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
}
