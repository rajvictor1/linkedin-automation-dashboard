import { z } from "zod";
import { generateNewsletter } from "@/lib/newsletter/pipeline";
import { ConfigurationError } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 300;

const requestSchema = z.object({
  topic: z.string().trim().min(4).max(160),
  includeLeadVisual: z.boolean().optional().default(true),
}).strict();

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) {
      return Response.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "The request is too large." } }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json({ error: { code: "INVALID_REQUEST", message: "Send a valid newsletter request." } }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: { code: "INVALID_REQUEST", message: "Topic is required (4-160 chars)." } }, { status: 400 });
    }

    const { topic, includeLeadVisual } = parsed.data;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

        void (async () => {
          try {
            const newsletter = await generateNewsletter(topic, includeLeadVisual, (event) => send(event));
            send({ type: "complete", data: newsletter });
          } catch (error) {
            if (error instanceof ConfigurationError) {
              send({ type: "error", error: { code: "PIPELINE_NOT_CONFIGURED", message: `${error.missing} is required on the server.` } });
            } else {
              send({ type: "error", error: { code: "GENERATION_FAILED", message: error instanceof Error ? error.message : String(error) } });
            }
          } finally {
            controller.close();
          }
        })();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json({ error: { code: "INVALID_REQUEST", message: "Send a valid newsletter request." } }, { status: 400 });
  }
}
