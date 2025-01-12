import cron from 'node-cron';

const scheduledTasks = new Map();

export async function scheduleMessage(channelId, message, time) {
  const timestamp = new Date(time).getTime();
  
  if (isNaN(timestamp)) {
    throw new Error('Invalid time format');
  }

  const date = new Date(timestamp);
  const cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
  
  const task = cron.schedule(cronExpression, async () => {
    try {
      const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
        body: JSON.stringify({
          content: message
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send scheduled message');
      }

      // Remove the task after successful execution
      const taskId = Array.from(scheduledTasks.entries())
        .find(([_, t]) => t === task)?.[0];
      if (taskId) {
        scheduledTasks.delete(taskId);
        task.stop();
      }
    } catch (error) {
      console.error('Error sending scheduled message:', error);
    }
  });

  const taskId = Date.now().toString();
  scheduledTasks.set(taskId, task);
  return taskId;
}