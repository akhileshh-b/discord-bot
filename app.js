import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from 'discord-interactions';

const app = express();

// Verify Discord requests middleware
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

// Parse JSON body and verify requests
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString() } }));
app.use(verifyDiscordRequest(process.env.PUBLIC_KEY));

// Handle interactions
app.post('/interactions', async function (req, res) {
  const { type, data } = req.body;

  // Handle verification requests
  if (type === InteractionType.PING) {
    console.log('Handling ping request');
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Handle slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Hello! The bot is working! 🎉',
        },
      });
    }
  }

  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'Command not found',
    },
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
  console.log('Use ngrok to make port', PORT, 'available publicly');
});