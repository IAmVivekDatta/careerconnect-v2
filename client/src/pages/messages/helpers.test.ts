import { describe, expect, it, vi } from "vitest";
import {
  isNearBottom,
  shouldFetchNextPage,
  submitMessage,
  validateFileSize
} from "./helpers";

const createScrollMetrics = (overrides: Partial<{ scrollTop: number; scrollHeight: number; clientHeight: number }> = {}) => ({
  scrollTop: 0,
  scrollHeight: 1000,
  clientHeight: 600,
  ...overrides
});

describe("messages helpers", () => {
  it("determines when another page should be fetched", () => {
    expect(shouldFetchNextPage(createScrollMetrics({ scrollTop: 10 }))).toBe(true);
    expect(shouldFetchNextPage(createScrollMetrics({ scrollTop: 120 }))).toBe(false);
  });

  it("detects when the scroll position is near the bottom", () => {
    expect(isNearBottom(createScrollMetrics({ scrollTop: 300, scrollHeight: 400 }))).toBe(true);
    expect(isNearBottom(createScrollMetrics({ scrollTop: 100 }))).toBe(false);
  });

  it("validates file size against the 5MB cap", () => {
    const withinLimit = new File([new ArrayBuffer(1024 * 1024)], "small.txt", { type: "text/plain" });
    const beyondLimit = new File([new ArrayBuffer(6 * 1024 * 1024)], "big.txt", { type: "text/plain" });

    expect(validateFileSize(withinLimit)).toBe(true);
    expect(validateFileSize(beyondLimit)).toBe(false);
  });

  it("submits a pure text message without uploading", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const upload = vi.fn();

    const result = await submitMessage({
      conversationId: "abc",
      text: " Hello world \n",
      file: null,
      upload,
      send
    });

    expect(upload).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ conversationId: "abc", content: "Hello world", attachmentUrl: undefined });
    expect(result).toEqual({ sent: true, attachmentUrl: undefined, content: "Hello world" });
  });

  it("uploads attachments before sending the payload", async () => {
    const mockFile = new File(["hi"], "snippet.ts", { type: "text/plain" });
    const send = vi.fn().mockResolvedValue(undefined);
    const upload = vi.fn().mockResolvedValue({ url: "https://cdn.test/file.ts" });

    const result = await submitMessage({
      conversationId: "conv-1",
      text: "  ",
      file: mockFile,
      upload,
      send
    });

    expect(upload).toHaveBeenCalledWith(mockFile);
    expect(send).toHaveBeenCalledWith({
      conversationId: "conv-1",
      content: "",
      attachmentUrl: "https://cdn.test/file.ts"
    });
    expect(result).toEqual({ sent: true, attachmentUrl: "https://cdn.test/file.ts", content: "" });
  });

  it("short-circuits when there is nothing to send", async () => {
    const send = vi.fn();
    const upload = vi.fn();

    const result = await submitMessage({
      conversationId: "conv-2",
      text: "   ",
      file: null,
      upload,
      send
    });

    expect(upload).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(result).toEqual({ sent: false });
  });

  it("skips submission when the conversation id is missing", async () => {
    const send = vi.fn();
    const upload = vi.fn();

    const result = await submitMessage({
      conversationId: null,
      text: "Message",
      file: null,
      upload,
      send
    });

    expect(upload).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(result).toEqual({ sent: false });
  });
});
