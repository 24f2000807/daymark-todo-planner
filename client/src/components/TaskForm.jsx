import { useEffect, useState } from 'react';
import { CATEGORIES, PRIORITIES, isValidDateOnly } from '../utils/taskUtils.js';

const EMPTY_FORM = {
  title: '', description: '', category: 'Other', priority: 'Medium', durationMinutes: '', dueDate: '',
};

function validate(values) {
  const fields = {};
  const title = values.title.trim();
  if (!title) fields.title = 'Add a title for this task.';
  else if (title.length > 120) fields.title = 'Use 120 characters or fewer.';
  if (values.description.length > 2000) fields.description = 'Use 2,000 characters or fewer.';
  const duration = Number(values.durationMinutes);
  if (!values.durationMinutes || !Number.isSafeInteger(duration) || duration <= 0) {
    fields.durationMinutes = 'Enter a whole number of minutes greater than zero.';
  }
  if (values.dueDate && !isValidDateOnly(values.dueDate)) fields.dueDate = 'Choose a real calendar date.';
  return fields;
}

export default function TaskForm({ editingTask, onSave, onCancel, saving, serverFields = {} }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setValues(editingTask ? {
      title: editingTask.title,
      description: editingTask.description || '',
      category: editingTask.category,
      priority: editingTask.priority,
      durationMinutes: String(editingTask.durationMinutes),
      dueDate: editingTask.dueDate || '',
    } : EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
  }, [editingTask]);

  function change(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (submitted) setErrors(validate(nextValues));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const details = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      priority: values.priority,
      durationMinutes: Number(values.durationMinutes),
      dueDate: values.dueDate || null,
    };
    const saved = await onSave(details);
    if (saved) {
      setValues(EMPTY_FORM);
      setErrors({});
      setSubmitted(false);
    }
  }

  function fieldError(name) {
    return errors[name] || serverFields[name];
  }

  return (
    <section className="form-panel" aria-labelledby="form-heading">
      <div className="section-heading">
        <div><p className="eyebrow">Make a little progress</p><h2 id="form-heading">{editingTask ? 'Edit task' : 'Add a task'}</h2></div>
        {editingTask && <button className="text-button" type="button" onClick={onCancel} disabled={saving}>Cancel editing</button>}
      </div>
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <label className="field field-wide" htmlFor="task-title">
            <span>Task title <span className="required">*</span></span>
            <input id="task-title" name="title" value={values.title} onChange={change} maxLength="120" aria-invalid={Boolean(fieldError('title'))} aria-describedby={fieldError('title') ? 'title-error' : undefined} placeholder="What needs doing?" required />
            {fieldError('title') && <span className="field-error" id="title-error">{fieldError('title')}</span>}
          </label>
          <label className="field field-wide" htmlFor="task-description">
            <span>Description</span>
            <textarea id="task-description" name="description" value={values.description} onChange={change} maxLength="2000" rows="2" aria-invalid={Boolean(fieldError('description'))} aria-describedby={fieldError('description') ? 'description-error' : undefined} placeholder="Add a few useful details (optional)" />
            {fieldError('description') && <span className="field-error" id="description-error">{fieldError('description')}</span>}
          </label>
          <label className="field" htmlFor="task-category"><span>Category</span>
            <select id="task-category" name="category" value={values.category} onChange={change}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
          </label>
          <label className="field" htmlFor="task-priority"><span>Priority</span>
            <select id="task-priority" name="priority" value={values.priority} onChange={change}>{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select>
          </label>
          <label className="field" htmlFor="task-duration"><span>Estimated time (minutes) <span className="required">*</span></span>
            <input id="task-duration" name="durationMinutes" type="number" min="1" step="1" inputMode="numeric" value={values.durationMinutes} onChange={change} aria-invalid={Boolean(fieldError('durationMinutes'))} aria-describedby={fieldError('durationMinutes') ? 'duration-error' : undefined} placeholder="25" required />
            {fieldError('durationMinutes') && <span className="field-error" id="duration-error">{fieldError('durationMinutes')}</span>}
          </label>
          <label className="field" htmlFor="task-due-date"><span>Due date</span>
            <input id="task-due-date" name="dueDate" type="date" value={values.dueDate} onChange={change} aria-invalid={Boolean(fieldError('dueDate'))} aria-describedby={fieldError('dueDate') ? 'date-error' : undefined} />
            {fieldError('dueDate') && <span className="field-error" id="date-error">{fieldError('dueDate')}</span>}
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? <><span className="spinner" aria-hidden="true" /> Saving…</> : editingTask ? 'Save changes' : 'Add task'}
          </button>
          <span className="form-hint"><span className="required">*</span> Required fields</span>
        </div>
      </form>
    </section>
  );
}
