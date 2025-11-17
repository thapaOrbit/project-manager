import cron from 'node-cron';
import Task from '../models/task.js';
import Project from '../models/project.js';
import NotificationService from './notification-service.js';

class DueDateScheduler {
  start() {
    // Run every hour to check due dates
    cron.schedule('0 * * * *', this.checkDueDates.bind(this));
    
    // Run every day at 9 AM for overdue checks
    cron.schedule('0 9 * * *', this.checkOverdueItems.bind(this));
    
    console.log('Due date scheduler started');
  }

  async checkDueDates() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check tasks due tomorrow
      const tasksDueTomorrow = await Task.find({
        dueDate: {
          $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        status: { $ne: 'Done' }
      });

      for (const task of tasksDueTomorrow) {
        await NotificationService.notifyTaskDueSoon(task._id);
      }

      // Check tasks due today
      const tasksDueToday = await Task.find({
        dueDate: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        },
        status: { $ne: 'Done' }
      });

      for (const task of tasksDueToday) {
        await NotificationService.notifyTaskDueToday(task._id);
      }

      // Check projects due tomorrow
      const projectsDueTomorrow = await Project.find({
        dueDate: {
          $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        status: { $ne: 'Completed' }
      });

      for (const project of projectsDueTomorrow) {
        await NotificationService.notifyProjectDueSoon(project._id);
      }

      // Check projects due today
      const projectsDueToday = await Project.find({
        dueDate: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        },
        status: { $ne: 'Completed' }
      });

      for (const project of projectsDueToday) {
        await NotificationService.notifyProjectDueToday(project._id);
      }

    } catch (error) {
      console.error('Error in due date scheduler:', error);
    }
  }

  async checkOverdueItems() {
    try {
      const now = new Date();

      // Check overdue tasks
      const overdueTasks = await Task.find({
        dueDate: { $lt: new Date(now.setHours(0, 0, 0, 0)) },
        status: { $ne: 'Done' }
      });

      for (const task of overdueTasks) {
        await NotificationService.notifyTaskOverdue(task._id);
      }

      // Check overdue projects
      const overdueProjects = await Project.find({
        dueDate: { $lt: new Date(now.setHours(0, 0, 0, 0)) },
        status: { $ne: 'Completed' }
      });

      for (const project of overdueProjects) {
        await NotificationService.notifyProjectOverdue(project._id);
      }

    } catch (error) {
      console.error('Error in overdue scheduler:', error);
    }
  }
}

export default new DueDateScheduler();