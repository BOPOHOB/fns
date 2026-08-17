import { Hono } from 'hono';
import {
  isInquiryTrainer,
  isInquiryTopic,
  TRAINER_LABELS,
  TOPIC_LABELS,
  type InquiryTrainer,
} from '@shared/inquiry.ts';
import {
  chatIdForTrainer,
  loadTelegramConfig,
  sendTelegramMessage,
} from '../telegram.ts';

const MIN_MESSAGE = 8;
const MAX_MESSAGE = 3500;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

const hits = new Map<string, number[]>();

function clientIp(c: { req: { header: (name: string) => string | undefined; raw: Request } }): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return c.req.header('x-real-ip') ?? 'unknown';
}

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function formatInquiry(trainer: InquiryTrainer, topicLabel: string, message: string): string {
  return [
    'Заявка с сайта FeelAndSwim',
    '',
    `Тренер: ${TRAINER_LABELS[trainer]}`,
    `Тема: ${topicLabel}`,
    '',
    message,
  ].join('\n');
}

export function inquiriesRoutes() {
  const app = new Hono();

  app.post('/', async (c) => {
    const telegram = loadTelegramConfig();
    if (!telegram) {
      return c.json({ error: 'Заявки временно недоступны' }, 503);
    }

    const ip = clientIp(c);
    if (tooMany(ip)) {
      return c.json({ error: 'Слишком много заявок, попробуйте позже' }, 429);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (typeof body !== 'object' || body === null) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const raw = body as Record<string, unknown>;
    if (!isInquiryTrainer(raw.trainer)) {
      return c.json({ error: 'Выберите тренера' }, 400);
    }
    if (!isInquiryTopic(raw.topic)) {
      return c.json({ error: 'Выберите тему' }, 400);
    }
    if (typeof raw.message !== 'string') {
      return c.json({ error: 'Напишите сообщение' }, 400);
    }

    const message = raw.message.trim();
    if (message.length < MIN_MESSAGE) {
      return c.json({ error: 'Добавьте контакты для связи' }, 400);
    }
    if (message.length > MAX_MESSAGE) {
      return c.json({ error: 'Сообщение слишком длинное' }, 400);
    }

    const text = formatInquiry(raw.trainer, TOPIC_LABELS[raw.topic], message);
    const chatId = chatIdForTrainer(telegram, raw.trainer);

    try {
      await sendTelegramMessage(chatId, telegram.token, text);
    } catch (err) {
      console.error('Telegram send failed:', err instanceof Error ? err.message : err);
      return c.json({ error: 'Не удалось отправить заявку' }, 502);
    }

    return c.json({ ok: true }, 201);
  });

  return app;
}
