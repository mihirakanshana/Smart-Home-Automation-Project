import { DeviceState } from '../types';

export interface VoiceParseResult {
  matched: boolean;
  intent: string;
  targetDevice?: 'fan';
  targetValue?: boolean;
  feedbackMessage: string;
  isBlocked?: boolean;
}

export function parseVoiceIntent(rawTranscript: string): VoiceParseResult {
  const text = rawTranscript.toLowerCase().trim();

  if (!text) {
    return {
      matched: false,
      intent: 'empty',
      feedbackMessage: "Sorry, I didn't catch that.",
    };
  }

  // --- FAN (Supported & Controllable) ---
  if (
    /(turn|switch|start|power|enable)\s+(on|up)\s+.*fan/i.test(text) ||
    /(can\s+you\s+|please\s+)?(turn|switch|start|power)\s+(on|up)\s+.*fan/i.test(text) ||
    /fan\s+(on|enable|start|running)/i.test(text) ||
    /(turn|switch|start).*fan.*on/i.test(text) ||
    /start.*fan/i.test(text)
  ) {
    return {
      matched: true,
      intent: 'fan_on',
      targetDevice: 'fan',
      targetValue: true,
      feedbackMessage: 'Fan command sent',
    };
  }

  if (
    /(turn|switch|stop|power|disable|shut)\s+(off|down)\s+.*fan/i.test(text) ||
    /(can\s+you\s+|please\s+)?(turn|switch|stop|power)\s+(off|down)\s+.*fan/i.test(text) ||
    /fan\s+(off|disable|stop)/i.test(text) ||
    /(turn|switch|stop).*fan.*off/i.test(text) ||
    /stop.*fan/i.test(text)
  ) {
    return {
      matched: true,
      intent: 'fan_off',
      targetDevice: 'fan',
      targetValue: false,
      feedbackMessage: 'Fan command sent',
    };
  }

  // --- BLOCKED DEVICES: LIGHT, DOOR, ALARM (Read-Only) ---
  const isLightCommand = /light/i.test(text);
  const isDoorCommand = /door|gate|unlock|lock|entrance/i.test(text);
  const isAlarmCommand = /alarm|siren|buzzer|arm|disarm/i.test(text);

  if (isLightCommand || isDoorCommand || isAlarmCommand) {
    return {
      matched: false,
      isBlocked: true,
      intent: isLightCommand ? 'light_blocked' : isDoorCommand ? 'door_blocked' : 'alarm_blocked',
      feedbackMessage: 'Only fan control is currently available.',
    };
  }

  return {
    matched: false,
    intent: 'unknown',
    feedbackMessage: "Sorry, I didn't understand that command. Try 'Turn on the fan' or 'Turn off the fan'.",
  };
}
