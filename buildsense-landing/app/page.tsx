"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("waitlist").insert([{ email }]);

    if (error) {
      setMessage("You're already on the waitlist or something went wrong.");
    } else {
      setMessage("You're on the waitlist 🚀");
      setEmail("");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      {/* HERO */}
      <section className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-bold leading-tight">
          Build in public with AI that tells you{" "}
          <span className="text-pink-500">what to build next</span>
        </h1>

        <p className="text-lg text-gray-300">
          BuildSense analyzes real user feedback from your posts and gives clear
          product direction — so you stop guessing and start building what
          people actually want.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-4 py-3 rounded-xl text-black w-72"
          />
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-semibold"
          >
            Join the waitlist
          </button>
        </form>

        {message && <p className="text-sm text-gray-400">{message}</p>}

        <p className="text-sm text-gray-500">
          For founders building in public • Early access soon
        </p>
      </section>

      {/* PROBLEM */}
      <section className="max-w-4xl mt-24 text-center space-y-8">
        <h2 className="text-3xl font-semibold">Founders are building blind</h2>

        <div className="grid sm:grid-cols-3 gap-6 text-gray-300">
          <p>Posting updates but not knowing what users truly want.</p>
          <p>Building features based on guesses, not real feedback.</p>
          <p>Missing the exact signal that could make the product grow.</p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="max-w-4xl mt-24 text-center space-y-6">
        <h2 className="text-3xl font-semibold">Meet BuildSense</h2>

        <p className="text-gray-300">
          AI reads discussions around your product, analyzes reactions to your
          posts, and tells you the next feature that actually matters.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mt-8 text-gray-300">
          <p>Share your build-in-public update</p>
          <p>AI analyzes real user conversations</p>
          <p>Get clear direction on what to build next</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mt-24 text-center space-y-6 mb-20">
        <h2 className="text-3xl font-semibold">
          Stop guessing. Start building what users want.
        </h2>

        <button className="bg-pink-500 hover:bg-pink-600 px-8 py-4 rounded-xl font-semibold text-lg">
          Join the BuildSense waitlist
        </button>
      </section>
    </main>
  );
}
