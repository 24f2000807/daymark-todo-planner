export function notFound(_request, response) {
  response.status(404).json({ error: { message: 'Route not found.' } });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ error: { message: 'Request body must be valid JSON.' } });
  }
  if (error.status && error.status < 500) {
    return response.status(error.status).json({
      error: {
        message: error.message,
        ...(Object.keys(error.fields || {}).length ? { fields: error.fields } : {}),
      },
    });
  }
  console.error(error);
  return response.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
}
