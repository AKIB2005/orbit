import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

export function aiServerPlugin(): Plugin {
  return {
    name: 'orbit-ai-server-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/ai/command', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // Read request body
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');

          try {
            const payload = JSON.parse(body);
            const { prompt, workspaceContext } = payload;

            const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

            if (!apiKey) {
              // Return fallback signal so client seamlessly uses local cognitive engine
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: false,
                  fallback: true,
                  reason: 'API_KEY_NOT_CONFIGURED',
                  message: 'No GEMINI_API_KEY configured in server environment. Gracefully falling back to Local Cognitive Engine.',
                })
              );
              return;
            }

            // Secure server-side call to Google Gemini API
            const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const systemPrompt = `You are ORBIT, an AI spatial productivity navigator for an interactive 3D universe.
Your goal is to help the user manage projects (planets), tasks (orbiting satellites), dependencies, and schedules.
Analyze the user request using the provided workspace snapshot:
${JSON.stringify(workspaceContext, null, 2)}

You MUST respond strictly with a valid JSON object matching this schema:
{
  "response": "Conversational helpful answer with insights, formatted with markdown bullets if applicable.",
  "suggestedActions": [
    {
      "type": "create_task" | "update_task_priority" | "schedule_task" | "create_project",
      "description": "Clear explanation of what this action will do",
      "payload": { ...appropriate fields for the action... }
    }
  ]
}

Action payloads:
- create_task: { "projectId": string, "title": string, "description": string, "priority": "low"|"medium"|"high"|"critical", "dueDate": number|null }
- update_task_priority: { "taskId": string, "newPriority": "low"|"medium"|"high"|"critical", "reason": string }
- schedule_task: { "taskId": string, "dueDate": number }
- create_project: { "name": string, "description": string, "colorTheme": "violet"|"cyan"|"rose"|"amber"|"emerald" }

If no structured actions are needed, return an empty array for suggestedActions.
Always output pure JSON, with no markdown fences (\`\`\`json).`;

            const response = await fetch(geminiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      { text: systemPrompt },
                      { text: `User request: ${prompt}` },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
              }),
            });

            if (!response.ok) {
              const errText = await response.text();
              console.warn('[ORBIT AI Server] Upstream API call error:', response.status, errText);
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: false,
                  fallback: true,
                  reason: 'UPSTREAM_API_ERROR',
                  message: `Upstream Gemini API returned status ${response.status}. Using Local Cognitive Engine fallback.`,
                })
              );
              return;
            }

            const data = (await response.json()) as {
              candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
            };
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: false,
                  fallback: true,
                  reason: 'EMPTY_RESPONSE',
                  message: 'Gemini returned empty response. Using Local Cognitive Engine fallback.',
                })
              );
              return;
            }

            const parsed = JSON.parse(textResponse);
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                provider: 'gemini',
                data: parsed,
              })
            );
          } catch (err: unknown) {
            console.error('[ORBIT AI Server] Middleware error:', err);
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: false,
                fallback: true,
                reason: 'MIDDLEWARE_EXCEPTION',
                message: err instanceof Error ? err.message : 'Server error occurred. Using Local Cognitive Engine fallback.',
              })
            );
          }
        });
      });
    },
  };
}
