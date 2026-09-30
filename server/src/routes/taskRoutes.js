import { Router } from 'express';
import { createTask, listTasks, removeTask, updateTask } from '../controllers/taskController.js';

const router = Router();

router.route('/').get(listTasks).post(createTask);
router.route('/:id').patch(updateTask).delete(removeTask);

export default router;
