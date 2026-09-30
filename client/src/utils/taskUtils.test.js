import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskSummary, isOverdue, isValidDateOnly, localToday } from './taskUtils.js';

test('combined filters use AND and counts describe every task', () => {
  const tasks = [
    { title: 'Read chapter', category: 'Study', priority: 'High', completed: false },
    { title: 'Buy tea', category: 'Shopping', priority: 'High', completed: true },
  ];
  const result = getTaskSummary(tasks, {
    status: 'pending', category: 'Study', priority: 'High', search: '  CHAPTER ',
  });
  assert.deepEqual(result.counts, { total: 2, pending: 1, completed: 1 });
  assert.equal(result.visibleTasks.length, 1);
  assert.equal(result.visibleTasks[0].title, 'Read chapter');
});

test('date-only validation accepts leap day and rejects impossible dates', () => {
  assert.equal(isValidDateOnly('2024-02-29'), true);
  assert.equal(isValidDateOnly('2025-02-29'), false);
  assert.equal(isValidDateOnly('2026-02-30'), false);
  assert.equal(isValidDateOnly('2026-2-03'), false);
});

test('overdue uses the local calendar day and excludes completed tasks', () => {
  const now = new Date(2026, 8, 30, 23, 30);
  assert.equal(localToday(now), '2026-09-30');
  assert.equal(isOverdue({ dueDate: '2026-09-29', completed: false }, now), true);
  assert.equal(isOverdue({ dueDate: '2026-09-30', completed: false }, now), false);
  assert.equal(isOverdue({ dueDate: '2026-09-29', completed: true }, now), false);
});
