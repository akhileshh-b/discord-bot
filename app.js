import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from 'discord-interactions';
import { scheduleMessage } from './utils.js';

const app = express();

// Verify Discord requests middleware for /interactions only
function verifyDiscordRequest(clientKey) {
  return async function (req, res, next) {
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const body = req.rawBody;
    
    const isValidRequest = verifyKey(
      body,
      signature,
      timestamp,
      clientKey
    );
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      return;
    }
    next();
  };
}

// Parse JSON body and verify requests for all routes
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString() } }));

// Apply Discord verification only to /interactions route
app.post('/interactions', verifyDiscordRequest(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    switch (name) {
      case 'test': {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Hello! The bot is working! 🎉',
          },
        });
      }

      case 'announce': {
        const channel = options.find(opt => opt.name === 'channel')?.value;
        const message = options.find(opt => opt.name === 'message')?.value;
        const attachment = options.find(opt => opt.name === 'attachment')?.value;

        try {
          const url = `https://discord.com/api/v10/channels/${channel}/messages`;
          const payload = { content: message };

          if (attachment) {
            const attachmentData = data.resolved.attachments[attachment];
            payload.embeds = [{
              image: {
                url: attachmentData.url
              }
            }];
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bot ${process.env.BOT_TOKEN}`,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error('Failed to send announcement');
          }

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Announcement sent successfully! 📢',
            },
          });
        } catch (error) {
          console.error('Error sending announcement:', error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Failed to send announcement. Please try again.',
            },
          });
        }
      }

      case 'schedule': {
        const channel = options.find(opt => opt.name === 'channel')?.value;
        const message = options.find(opt => opt.name === 'message')?.value;
        const time = options.find(opt => opt.name === 'time')?.value;

        try {
          await scheduleMessage(channel, message, time);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Message scheduled for ${time} 📅`,
            },
          });
        } catch (error) {
          console.error('Error scheduling message:', error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Failed to schedule message. Please check the time format (YYYY-MM-DD HH:mm).',
            },
          });
        }
      }
    }
  }

  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'Command not found',
    },
  });
});

// Add the heartbeat route that doesn't need verification
app.get('/heartbeat', (req, res) => {
  res.status(200).send('Bot is alive! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
