import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, allTaskCount, busy, onToggle, onEdit, onDelete, onRetry }) {
  if (!tasks.length) {
    const isEmpty = allTaskCount === 0;
    return (
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">{isEmpty ? '+' : '⌕'}</span>
        <h3>{isEmpty ? 'A clear page.' : 'No tasks match.'}</h3>
        <p>{isEmpty ? 'Add your first task above and make a start.' : 'Try another search or clear your filters.'}</p>
        {!isEmpty && <button className="text-button" type="button" onClick={onRetry}>Clear filters</button>}
      </div>
    );
  }

  return (
    <div className="task-list" aria-label="Tasks">
      {tasks.map((task) => <TaskItem key={task._id} task={task} busy={busy} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}
