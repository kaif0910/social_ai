const BASE_URL = "http://localhost:5000";

export async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects`, { cache: "no-store" });
  return res.json();
}

export async function getSummary(id: string) {
  const res = await fetch(`${BASE_URL}/projects/${id}/summary`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getAnalysis(id: string) {
  const res = await fetch(`${BASE_URL}/projects/${id}/analysis`, {
    cache: "no-store",
  });
  return res.json();
}

export async function runFullAnalysis(id: string, redditPostUrl: string) {
  const res = await fetch(`${BASE_URL}/projects/${id}/full-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redditPostUrl }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Backend error: " + text);
  }

  return res.json();
}


