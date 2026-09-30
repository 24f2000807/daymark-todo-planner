import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from './api/tasks.js';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';
import { getTaskSummary } from './utils/taskUtils.js';

const INITIAL_FILTERS = { search: '', status: 'all', category: '', priority: '' };

function sortNewestFirst(tasks) {
  return [...tasks].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [serverFields, setServerFields] = useState({});
  const [saving, setSaving] = useState(false);

  async function loadTasks() {
    setLoading(true);
    setLoadError('');
    try {
      const result = await getTasks();
      setTasks(sortNewestFirst(result.tasks));
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  const { counts, visibleTasks } = getTaskSummary(tasks, filters);

  function changeFilters(changes) {
    setFilters((current) => ({ ...current, ...changes }));
  }

  async function saveTask(details) {
    setSaving(true);
    setMutationError('');
    setServerFields({});
    try {
      if (editingTask) {
        const result = await updateTask(editingTask._id, details);
        setTasks((current) => sortNewestFirst(current.map((task) => task._id === result.task._id ? result.task : task)));
        setEditingTask(null);
      } else {
        const result = await createTask(details);
        setTasks((current) => sortNewestFirst([...current, result.task]));
      }
      return true;
    } catch (error) {
      setMutationError(error.status === 404 ? `${error.message} Reload the task list before trying again.` : error.message);
      setServerFields(error.fields || {});
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setSaving(true);
    setMutationError('');
    try {
      const result = await updateTask(task._id, { completed: !task.completed });
      setTasks((current) => current.map((item) => item._id === result.task._id ? result.task : item));
    } catch (error) {
      setMutationError(error.status === 404 ? `${error.message} Reload to refresh your tasks.` : error.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTask) return;
    setSaving(true);
    setMutationError('');
    try {
      await deleteTask(deletingTask._id);
      setTasks((current) => current.filter((task) => task._id !== deletingTask._id));
      if (editingTask?._id === deletingTask._id) setEditingTask(null);
      setDeletingTask(null);
    } catch (error) {
      setMutationError(error.status === 404 ? `${error.message} Reload to refresh your tasks.` : error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Daymark home"><span className="brand-mark" aria-hidden="true">d.</span> daymark</a>
        <span className="local-note"><span className="local-dot" /> Local planner</span>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy"><p className="eyebrow">A little structure for today</p><h1>Make room<br />for what <em>matters.</em></h1></div>
        <p className="intro-note">One task at a time.<br />Your plans stay on this machine.</p>
      </section>

      <TaskStats counts={counts} />

      <TaskForm editingTask={editingTask} onSave={saveTask} onCancel={() => { setEditingTask(null); setServerFields({}); setMutationError(''); }} saving={saving} serverFields={serverFields} />

      {loadError && <div className="notice error-notice" role="alert"><span>{loadError}</span><button type="button" className="text-button" onClick={loadTasks}>Try again</button></div>}
      {mutationError && <div className="notice error-notice" role="alert"><span>{mutationError}</span><button type="button" className="text-button" onClick={() => setMutationError('')}>Dismiss</button></div>}

      <section className="tasks-section" aria-labelledby="tasks-heading">
        <div className="list-heading"><div><p className="eyebrow">Your list</p><h2 id="tasks-heading">Tasks <span className="heading-count">{counts.total}</span></h2></div></div>
        <TaskFilters filters={filters} onChange={changeFilters} visibleCount={visibleTasks.length} />
        {loading ? <div className="loading-state" role="status"><span className="spinner" aria-hidden="true" /> Loading your tasks…</div>
          : loadError ? <div className="empty-state"><h3>Your tasks aren't available yet.</h3><p>Check the server connection, then try again.</p></div>
            : <TaskList tasks={visibleTasks} allTaskCount={tasks.length} busy={saving} onToggle={toggleTask} onEdit={(task) => { setEditingTask(task); setMutationError(''); setServerFields({}); }} onDelete={setDeletingTask} onRetry={() => setFilters(INITIAL_FILTERS)} />}
      </section>

      <footer className="page-footer"><span>DAYMARK / TASK PLANNER</span><span>Small steps count.</span></footer>
      <ConfirmDialog task={deletingTask} deleting={saving} onCancel={() => setDeletingTask(null)} onConfirm={confirmDelete} />
    </main>
  );
}
