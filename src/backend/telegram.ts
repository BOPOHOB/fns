type TelegramConfig = {
  token: string;
  defaultChatId: string;
  chatByTrainer: Partial<Record<'slava' | 'anya' | 'any', string>>;
};

function env(name: string): string | undefined {
  const value = Deno.env.get(name)?.trim();
  return value || undefined;
}

function loadTelegramConfig(): TelegramConfig | null {
  const token = env('BOT_TOKEN');
  const defaultChatId = env('CHAT_ID');
  if (!token || !defaultChatId) return null;

  return {
    token,
    defaultChatId,
    chatByTrainer: {
      any: env('CHAT_ID_ANY') ?? defaultChatId,
      slava: env('CHAT_ID_SLAVA'),
      anya: env('CHAT_ID_ANYA'),
    },
  };
}

function chatIdForTrainer(
  config: TelegramConfig,
  trainer: 'any' | 'slava' | 'anya',
): string {
  return config.chatByTrainer[trainer] ?? config.defaultChatId;
}

async function sendTelegramMessage(chatId: string, token: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  const raw = await res.text();
  let ok = res.ok;
  let description = raw;
  try {
    const json = JSON.parse(raw) as { ok?: boolean; description?: string };
    if (typeof json.ok === 'boolean') ok = json.ok;
    if (typeof json.description === 'string') description = json.description;
  } catch {
    // keep raw body
  }

  if (!ok) {
    throw new Error(description || `Telegram HTTP ${res.status}`);
  }
}

export { loadTelegramConfig, chatIdForTrainer, sendTelegramMessage, type TelegramConfig };
