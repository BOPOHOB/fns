import type { InquiryBody } from '../shared/inquiry';
import { apiFetch } from './client';

const submitInquiry = (body: InquiryBody) =>
  apiFetch<{ ok: true }>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export { submitInquiry };
