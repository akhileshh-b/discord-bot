export const TEST_COMMAND = {
    name: 'test',
    description: 'Basic test command',
    type: 1,
  };
  
  export const ANNOUNCE_COMMAND = {
    name: 'announce',
    description: 'Send an announcement to a specific channel',
    type: 1,
    options: [
      {
        name: 'channel',
        description: 'Channel to send the announcement to',
        type: 7,
        required: true,
        channel_types: [0]
      },
      {
        name: 'message',
        description: 'The announcement message',
        type: 3,
        required: true
      },
      {
        name: 'attachment',
        description: 'Image to attach to the announcement',
        type: 11,
        required: false
      }
    ]
  };
  
  export const SCHEDULE_COMMAND = {
    name: 'schedule',
    description: 'Schedule an announcement',
    type: 1,
    options: [
      {
        name: 'channel',
        description: 'Channel to send the announcement to',
        type: 7,
        required: true,
        channel_types: [0]
      },
      {
        name: 'message',
        description: 'The announcement message',
        type: 3,
        required: true
      },
      {
        name: 'time',
        description: 'When to send (format: YYYY-MM-DD HH:mm)',
        type: 3,
        required: true
      }
    ]
  };
  
  export const ALL_COMMANDS = [TEST_COMMAND, ANNOUNCE_COMMAND, SCHEDULE_COMMAND];