import { type NextRequest } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};
// File.prototype.size to read file size on stream
// File.prototype.type to determine MIME type
// Blob.prototype.stream() Transforms the File into a ReadableStream that can be used to read the File contents.

/**
 * @note Example implementation of an edge-enabled transform stream
 * visit /api/transform-stream on localhost to see it in action
 * @alpha
 * @param _
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function handler(_: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // A readable stream that we'll pipe through the transform stream below.
  // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/ReadableStream
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('Vercel Edge Functions + Streams + Transforms'));
      controller.close();
    },
  });

  // This transform stream adds the HTML markup and transforms the chunks
  // of text in the readable stream to uppercase.
  // https://developer.mozilla.org/en-US/docs/Web/API/TransformStream/TransformStream
  const transform = new TransformStream({
    start(controller) {
      controller.enqueue(
        encoder.encode('<html><head><title>Vercel Edge Functions + Streams + Transforms</title></head><body>')
      );
    },
    transform(chunk, controller) {
      controller.enqueue(encoder.encode(decoder.decode(chunk, { stream: true }).toUpperCase()));
    },
    flush(controller) {
      controller.enqueue(encoder.encode('</body></html>'));
    },
  });

  // Pipe the readable stream to the transform stream and stream it to the response.
  // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/pipeThrough
  return new Response(readable.pipeThrough(transform), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
