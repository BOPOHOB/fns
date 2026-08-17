import { useState } from 'react';
import { Alert, Avatar, Card, Radio, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { AsyncButton } from '../../components/asyncButton';
import { submitInquiry } from '../../api/inquiries';
import {
  TRAINER_OPTIONS,
  TOPIC_OPTIONS,
  type InquiryTrainer,
  type InquiryTopic,
} from '../../shared/inquiry';

import cn from './trainer.module.less';

const MESSAGE_PLACEHOLDER =
  'Главное, оставьте контакты для связи (телефон/телеграм/макс/вк, что удобно), ещё полезно будет желаемое время занятий, ваш уровень плавания и цели';

const TRAINERS = [
  {
    id: 'slava',
    name: 'Слава',
    role: 'Тренер',
    bio: 'Групповые и индивидуальные тренировки. Помогу с техникой, выносливостью и уверенностью в воде — от первых метров до осознанного плавания.',
  },
  {
    id: 'anya',
    name: 'Аня',
    role: 'Тренер',
    bio: 'Групповые и индивидуальные занятия. Разберём цели, подберём нагрузку и поможем плавать легче и стабильнее.',
  },
] as const;

const TrainerPage = () => {
  const [trainer, setTrainer] = useState<InquiryTrainer>('any');
  const [topic, setTopic] = useState<InquiryTopic>('other');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const valid = message.trim().length >= 8;

  const handleSend = async () => {
    if (!valid) return;
    setError(null);
    try {
      await submitInquiry({
        trainer,
        topic,
        message: message.trim(),
      });
      setSent(true);
      setMessage('');
      setTrainer('any');
      setTopic('other');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className={cn.page}>
      <Typography.Title level={2}>Тренеры</Typography.Title>
      <Typography.Paragraph type="secondary">
        FeelAndSwim — Слава и Аня. Напишите нам, если хотите в группу, на индивидуальное занятие
        или просто задать вопрос.
      </Typography.Paragraph>

      <div className={cn.cards}>
        {TRAINERS.map((person) => (
          <Card key={person.id} className={cn.card}>
            <div className={cn.cardHead}>
              <Avatar size={56}>{person.name.slice(0, 1)}</Avatar>
              <div>
                <Typography.Title level={4} className={cn.name}>
                  {person.name}
                </Typography.Title>
                <Typography.Text type="secondary">{person.role}</Typography.Text>
              </div>
            </div>
            <Typography.Paragraph className={cn.bio}>{person.bio}</Typography.Paragraph>
          </Card>
        ))}
      </div>

      <Typography.Title level={3}>Записаться</Typography.Title>

      {sent && (
        <Alert
          type="success"
          showIcon
          title="Заявка отправлена"
          description="Мы напишем вам в ближайшее время."
          className={cn.field}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          className={cn.field}
          closable
          onClose={() => setError(null)}
        />
      )}

      <Radio.Group
        className={cn.field}
        optionType="button"
        buttonStyle="solid"
        block
        value={trainer}
        onChange={(e) => setTrainer(e.target.value)}
        options={TRAINER_OPTIONS}
      />
      <Radio.Group
        className={cn.field}
        optionType="button"
        buttonStyle="solid"
        block
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        options={TOPIC_OPTIONS}
      />
      <TextArea
        className={cn.field}
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={MESSAGE_PLACEHOLDER}
      />
      <AsyncButton type="primary" disabled={!valid} onClick={handleSend}>
        Отправить (контакты для связи в сообщении есть)
      </AsyncButton>
    </div>
  );
};

export { TrainerPage };
