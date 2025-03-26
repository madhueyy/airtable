import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Navbar from "~/app/_components/navbar";
import Sidebar from "./_components/sidebar";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  const userEmail = session?.user?.name;

  return (
    <HydrateClient>
      <Navbar userEmail={userEmail} />

      <main className="flex min-h-screen flex-row bg-gray-100">
        <Sidebar />

        <div className="mt-8 ml-14">
          <p className="text-3xl font-semibold text-black">Home</p>

          <p className="mt-10">Recent bases</p>
        </div>
      </main>
    </HydrateClient>
  );
}
