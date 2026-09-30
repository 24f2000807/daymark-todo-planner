async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the API is running, then try again.');
  }

  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    if (!response.ok) throw new Error('The server returned an unreadable response. Try again.');
    throw new Error('The server response was incomplete. Try again.');
  }

  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'The request could not be completed.');
    error.fields = payload?.error?.fields || {};
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function getTasks() {
  return request('/api/tasks');
}

export function createTask(details) {
  return request('/api/tasks', { method: 'POST', body: JSON.stringify(details) });
}

export function updateTask(id, details) {
  return request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(details) });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: 'DELETE' });
}
