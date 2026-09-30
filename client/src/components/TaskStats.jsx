export default function TaskStats({ counts }) {
  return (
    <section className="stats" aria-label="Task totals">
      <div className="stat stat-total"><span className="stat-number">{counts.total}</span><span className="stat-label">Total tasks</span></div>
      <div className="stat stat-pending"><span className="stat-number">{counts.pending}</span><span className="stat-label">Pending</span></div>
      <div className="stat stat-completed"><span className="stat-number">{counts.completed}</span><span className="stat-label">Completed</span></div>
    </section>
  );
}
