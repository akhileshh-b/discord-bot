import { ALL_COMMANDS } from './commands.js';
import 'dotenv/config';

const response = await fetch(
  `https://discord.com/api/v10/applications/${process.env.APP_ID}/commands`,
  {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
    },
    method: 'PUT',
    body: JSON.stringify(ALL_COMMANDS),
  }
);

if (response.ok) {
  console.log('Successfully registered all commands');
  const data = await response.json();
  console.log(data);
} else {
  console.error('Error registering commands');
  const text = await response.text();
  console.error(text);
}