import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const clientBuildDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../client/dist');

app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_request, response) => {
  const ready = app.locals.databaseReady?.() ?? false;
  response.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' });
});
app.use('/api/tasks', taskRoutes);
app.use('/api', notFound);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildDirectory));
  app.get('*', (_request, response, next) => {
    response.sendFile(resolve(clientBuildDirectory, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

app.use(errorHandler);

export default app;
