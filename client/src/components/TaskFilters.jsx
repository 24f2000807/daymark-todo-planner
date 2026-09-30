import { CATEGORIES, PRIORITIES } from '../utils/taskUtils.js';

const VIEWS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export default function TaskFilters({ filters, onChange, visibleCount }) {
  const active = filters.search || filters.category || filters.priority;
  return (
    <section className="task-toolbar" aria-label="Task views and filters">
      <div className="view-row">
        <div className="view-tabs" role="group" aria-label="Show tasks">
          {VIEWS.map((view) => <button key={view.value} type="button" className={`view-tab ${filters.status === view.value ? 'active' : ''}`} aria-pressed={filters.status === view.value} onClick={() => onChange({ status: view.value })}>{view.label}</button>)}
        </div>
        <span className="result-count" aria-live="polite">{visibleCount} {visibleCount === 1 ? 'task' : 'tasks'}</span>
      </div>
      <div className="filter-row">
        <label className="search-field" htmlFor="task-search"><span className="sr-only">Search by title</span>
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
          <input id="task-search" type="search" value={filters.search} onChange={(event) => onChange({ search: event.target.value })} placeholder="Search tasks" />
        </label>
        <label className="filter-select" htmlFor="filter-category"><span className="sr-only">Filter by category</span>
          <select id="filter-category" value={filters.category} onChange={(event) => onChange({ category: event.target.value })}><option value="">All categories</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
        </label>
        <label className="filter-select" htmlFor="filter-priority"><span className="sr-only">Filter by priority</span>
          <select id="filter-priority" value={filters.priority} onChange={(event) => onChange({ priority: event.target.value })}><option value="">All priorities</option>{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select>
        </label>
        {active && <button className="clear-button" type="button" onClick={() => onChange({ search: '', category: '', priority: '' })}>Clear filters</button>}
      </div>
    </section>
  );
}
