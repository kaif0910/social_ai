import Link from "next/link";
import { getProjects } from "@/lib/api";

export default async function Dashboard() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">BuildSense Dashboard</h1>

      <div className="space-y-4">
        {projects.map((p: any) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:bg-gray-800 transition cursor-pointer">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-sm text-gray-400">
                Created: {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
