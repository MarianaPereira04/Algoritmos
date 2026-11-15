const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const CONNECTION_ERROR = "No se pudo conectar con el servidor";

export async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(CONNECTION_ERROR);
  }

  if (!response.ok) {
    let payload: { message?: unknown };
    try {
      payload = await response.json();
    } catch {
      throw new Error(CONNECTION_ERROR);
    }
    const message = Array.isArray(payload.message)
      ? payload.message.join(" ")
      : payload.message;
    throw new Error(typeof message === "string" ? message : CONNECTION_ERROR);
  }

  return (await response.json()) as T;
}
