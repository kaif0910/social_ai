import { runFullAnalysis } from "@/lib/api";

import { getSummary, getAnalysis } from "@/lib/api";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const summary = await getSummary(id);
  const analysis = await getAnalysis(id);

  return (
    <main className="min-h-screen bg-black text-white p-10 space-y-10">
      <h1 className="text-3xl font-bold">Project Intelligence</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          const redditPostUrl = formData.get("redditPostUrl") as string;
          await runFullAnalysis(id, redditPostUrl);
        }}
        className="flex gap-3"
      >
        <input
          name="redditPostUrl"
          placeholder="Paste Reddit post URL"
          required
          className="px-4 py-2 rounded-lg text-black w-96"
        />

        <button className="bg-white hover:bg-gray-200 px-6 py-2 rounded-lg font-semibold text-black">
          Run Full AI Analysis
        </button>
      </form>

      {/* SUMMARY */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat title="Analyses" value={summary.totalAnalyses} />
          <Stat title="Feedback Posts" value={summary.totalFeedbackPosts} />
          <Stat title="Agreement" value={summary?.sentiment?.agreement ?? 0} />
          <Stat
            title="Disagreement"
            value={summary?.sentiment?.disagreement ?? 0}
          />
        </div>
      )}

      {/* ROADMAP */}
      {analysis?.last_roadmap && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">AI Roadmap</h2>

          <div className="space-y-4">
            {analysis.last_roadmap.roadmap.map((step: any) => (
              <div
                key={step.step}
                className="border border-gray-800 rounded-xl p-4 bg-gray-900"
              >
                <p className="text-pink-400 font-semibold">
                  Step {step.step}: {step.feature}
                </p>
                <p className="text-sm text-gray-300 mt-1">{step.reason}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Impact: {step.expected_impact}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!analysis && (
        <p className="text-gray-400">
          No AI analysis yet. Run analysis from backend first.
        </p>
      )}
    </main>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border border-gray-800 rounded-xl p-4 bg-gray-900">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
