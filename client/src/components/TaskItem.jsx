import { formatDateOnly, isOverdue } from '../utils/taskUtils.js';

export default function TaskItem({ task, onToggle, onEdit, onDelete, busy }) {
  const overdue = isOverdue(task);
  return (
    <article className={`task-item ${task.completed ? 'is-completed' : ''}`}>
      <button className="complete-control" type="button" onClick={() => onToggle(task)} disabled={busy} aria-label={task.completed ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`} aria-pressed={task.completed}>
        <span className="checkmark" aria-hidden="true">{task.completed ? '✓' : ''}</span>
      </button>
      <div className="task-main">
        <div className="task-title-row"><h3>{task.title}</h3>{overdue && <span className="overdue-label">Overdue</span>}</div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className="meta-tag category-tag">{task.category}</span>
          <span className={`meta-tag priority-${task.priority.toLowerCase()}`}>{task.priority} priority</span>
          <span>{task.durationMinutes} min</span>
          {task.dueDate && <span className={overdue ? 'due-date overdue-text' : ''}>Due {formatDateOnly(task.dueDate)}</span>}
          <span className="status-text">{task.completed ? 'Completed' : 'Pending'}</span>
        </div>
      </div>
      <div className="task-actions">
        <button type="button" className="icon-button" onClick={() => onEdit(task)} disabled={busy} aria-label={`Edit ${task.title}`} title="Edit task">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 5 5 5M4 20l4.2-.9L19.5 7.8a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" /></svg>
        </button>
        <button type="button" className="icon-button delete-button" onClick={() => onDelete(task)} disabled={busy} aria-label={`Delete ${task.title}`} title="Delete task">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>
        </button>
      </div>
    </article>
  );
}
