export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

const DEFAULT_TOP_THRESHOLD = 60;
const DEFAULT_BOTTOM_THRESHOLD = 80;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const shouldFetchNextPage = (
  metrics: ScrollMetrics,
  threshold: number = DEFAULT_TOP_THRESHOLD
): boolean => metrics.scrollTop < threshold;

export const isNearBottom = (
  metrics: ScrollMetrics,
  threshold: number = DEFAULT_BOTTOM_THRESHOLD
): boolean => metrics.scrollHeight - (metrics.scrollTop + metrics.clientHeight) < threshold;

export const validateFileSize = (file: File, maxBytes: number = MAX_ATTACHMENT_BYTES): boolean =>
  file.size <= maxBytes;

export interface SubmitMessageArgs {
  conversationId: string | null;
  text: string;
  file: File | null;
  upload: (file: File) => Promise<{ url: string }>;
  send: (payload: { conversationId: string; content: string; attachmentUrl?: string }) => Promise<unknown>;
}

export interface SubmitMessageResult {
  sent: boolean;
  attachmentUrl?: string;
  content?: string;
}

export const submitMessage = async ({
  conversationId,
  text,
  file,
  upload,
  send
}: SubmitMessageArgs): Promise<SubmitMessageResult> => {
  if (!conversationId) {
    return { sent: false };
  }

  const trimmed = text.trim();
  const hasContent = trimmed.length > 0;
  const hasAttachment = Boolean(file);

  if (!hasContent && !hasAttachment) {
    return { sent: false };
  }

  let attachmentUrl: string | undefined;
  if (file) {
    const { url } = await upload(file);
    attachmentUrl = url;
  }

  await send({ conversationId, content: trimmed, attachmentUrl });

  return {
    sent: true,
    attachmentUrl,
    content: trimmed
  };
};
