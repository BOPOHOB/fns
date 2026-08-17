const TRAINERS = ['any', 'slava', 'anya'] as const;
const TOPICS = ['group', 'individual', 'other'] as const;

type InquiryTrainer = (typeof TRAINERS)[number];
type InquiryTopic = (typeof TOPICS)[number];

type InquiryBody = {
  trainer: InquiryTrainer;
  topic: InquiryTopic;
  message: string;
};

const TRAINER_LABELS: Record<InquiryTrainer, string> = {
  any: 'к любому',
  slava: 'к Славе',
  anya: 'к Ане',
};

const TOPIC_LABELS: Record<InquiryTopic, string> = {
  group: 'Занятие в группе',
  individual: 'Персоналка',
  other: 'Другой вопрос',
};

const TRAINER_OPTIONS = TRAINERS.map((value) => ({
  value,
  label: TRAINER_LABELS[value],
}));

const TOPIC_OPTIONS = TOPICS.map((value) => ({
  value,
  label: TOPIC_LABELS[value],
}));

function isInquiryTrainer(value: unknown): value is InquiryTrainer {
  return typeof value === 'string' && (TRAINERS as readonly string[]).includes(value);
}

function isInquiryTopic(value: unknown): value is InquiryTopic {
  return typeof value === 'string' && (TOPICS as readonly string[]).includes(value);
}

export {
  TRAINERS,
  TOPICS,
  TRAINER_LABELS,
  TOPIC_LABELS,
  TRAINER_OPTIONS,
  TOPIC_OPTIONS,
  isInquiryTrainer,
  isInquiryTopic,
  type InquiryTrainer,
  type InquiryTopic,
  type InquiryBody,
};
