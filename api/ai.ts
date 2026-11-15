export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, workspaceContext } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        reason: 'API_KEY_NOT_CONFIGURED',
        message: 'No GEMINI_API_KEY configured in server environment. Gracefully falling back to Local Cognitive Engine.',
      });
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are ORBIT, an AI spatial productivity navigator for an interactive 3D universe.
Your goal is to help the user manage projects (planets), tasks (orbiting satellites), dependencies, and schedules.
Analyze the user request using the provided workspace snapshot:
${JSON.stringify(workspaceContext || {}, null, 2)}

Respond in valid JSON format:
{
  "message": "Direct concise explanation to the user",
  "actions": [
    {
      "id": "action_id",
      "type": "create_task" | "update_task_priority" | "schedule_task" | "create_project",
      "description": "Readable summary of what this action accomplishes",
      "payload": { ... }
    }
  ]
}`;

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser request: "${prompt}"` }] }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(200).json({
        success: false,
        fallback: true,
        reason: 'GEMINI_UPSTREAM_ERROR',
        details: errText,
      });
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = candidateText ? JSON.parse(candidateText) : null;

    return res.status(200).json({
      success: true,
      provider: 'gemini',
      message: parsed?.message || 'Instructions compiled successfully.',
      actions: parsed?.actions || [],
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      fallback: true,
      error: err.message,
    });
  }
}
