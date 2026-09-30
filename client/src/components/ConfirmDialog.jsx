import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ task, onCancel, onConfirm, deleting }) {
  const cancelButton = useRef(null);
  const cancelAction = useRef(onCancel);

  useEffect(() => { cancelAction.current = onCancel; }, [onCancel]);

  useEffect(() => {
    if (!task) return undefined;
    cancelButton.current?.focus();
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !deleting) cancelAction.current();
      if (event.key === 'Tab') {
        const buttons = event.currentTarget.querySelectorAll('button:not(:disabled)');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    const dialog = document.querySelector('[role="alertdialog"]');
    dialog?.addEventListener('keydown', handleKeyDown);
    return () => dialog?.removeEventListener('keydown', handleKeyDown);
  }, [task, deleting]);

  if (!task) return null;
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-heading" aria-describedby="delete-description">
        <p className="eyebrow">This can't be undone</p>
        <h2 id="delete-heading">Delete this task?</h2>
        <p id="delete-description">“{task.title}” will be permanently removed from your planner.</p>
        <div className="dialog-actions">
          <button ref={cancelButton} className="secondary-button" type="button" onClick={onCancel} disabled={deleting}>Keep task</button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete task'}</button>
        </div>
      </section>
    </div>
  );
}
