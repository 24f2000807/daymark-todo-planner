export const CATEGORIES = ['Personal', 'Work', 'Study', 'Shopping', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

export function isValidDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function localToday(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(task, now = new Date()) {
  return !task.completed && Boolean(task.dueDate) && task.dueDate < localToday(now);
}

export function formatDateOnly(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

export function getTaskSummary(tasks, filters = {}) {
  const counts = tasks.reduce((summary, task) => {
    summary.total += 1;
    summary[task.completed ? 'completed' : 'pending'] += 1;
    return summary;
  }, { total: 0, pending: 0, completed: 0 });

  const search = (filters.search || '').trim().toLowerCase();
  const visibleTasks = tasks.filter((task) => {
    const matchesStatus = filters.status === 'pending' ? !task.completed
      : filters.status === 'completed' ? task.completed : true;
    const matchesCategory = !filters.category || task.category === filters.category;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesSearch = !search || task.title.toLowerCase().includes(search);
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  return { counts, visibleTasks };
}
