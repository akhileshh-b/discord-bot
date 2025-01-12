import cron from 'node-cron';
import { sendAnnouncement } from './utils.js';

// Store scheduled messages in memory (for simplicity)
const scheduledMessages = new Map();

export function scheduleMessage({ channel, message, time }) {
  const timestamp = new Date(time).getTime();
  
  if (isNaN(timestamp)) {
    throw new Error('Invalid time format');
  }

  const id = Date.now().toString();
  
  // Create a cron schedule
  const date = new Date(timestamp);
  const cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
  
  const task = cron.schedule(cronExpression, async () => {
    try {
      await sendAnnouncement(channel, message);
      // Remove the task after execution
      scheduledMessages.delete(id);
      task.stop();
    } catch (error) {
      console.error('Error sending scheduled message:', error);
    }
  });

  scheduledMessages.set(id, { task, channel, message, time });
  return id;
}
