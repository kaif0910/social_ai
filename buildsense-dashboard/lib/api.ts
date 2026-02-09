const BASE_URL = "http://localhost:5000";

export async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch projects");

  return res.json();
}
