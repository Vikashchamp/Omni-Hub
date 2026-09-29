export interface SummarizeRequestPayload {
  title: string;
  url: string;
  content: string;
}

export interface SummarizeResponsePayload {
  success: boolean;
  summary: string;
  title: string;
  url: string;
}

// Configurable backend URL with local fallback
export const BACKEND_URL =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  'http://localhost:8000';

export async function requestPageSummary(
  payload: SummarizeRequestPayload
): Promise<SummarizeResponsePayload> {
  const endpoint = `${BACKEND_URL}/api/v1/ai/summarize`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.detail) {
          if (Array.isArray(errJson.detail)) {
            errorMessage = errJson.detail.map((d: { msg?: string }) => d.msg || '').join(', ');
          } else {
            errorMessage = String(errJson.detail);
          }
        }
      } catch {
        // Response was not JSON
      }
      throw new Error(errorMessage);
    }

    const data: SummarizeResponsePayload = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(
        `Unable to reach OMNI backend at ${BACKEND_URL}. Ensure the FastAPI server is running.`
      );
    }
    throw err;
  }
}
