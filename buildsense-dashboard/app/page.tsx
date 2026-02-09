import { getProjects } from "@/lib/api";
import Link from "next/link";

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">BuildSense Dashboard</h1>

      {projects.length === 0 ? (
        <p className="text-gray-400">No projects yet.</p>
      ) : (
        <div className="grid gap-4">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="border border-gray-800 p-6 rounded-xl hover:bg-gray-900 transition"
            >
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <p className="text-sm text-gray-400">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
