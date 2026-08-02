import { generateCarousel } from "@/lib/carousel/pipeline";
import { ConfigurationError } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 900;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Object.keys(body || {}).length > 0) {
      return Response.json({ error: { code: "INVALID_REQUEST", message: "This workflow does not accept input." } }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

        void (async () => {
          try {
            const carousel = await generateCarousel((event) => send(event));
            send({ type: "complete", data: carousel });
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
    return Response.json({ error: { code: "INVALID_REQUEST", message: "Send empty JSON or no body." } }, { status: 400 });
  }
}
