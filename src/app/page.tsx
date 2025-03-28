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

  return (
    <HydrateClient>
      <div>
        <Navbar userEmail={session?.user.email} />

        <main className="flex min-h-screen flex-row items-center justify-center bg-gray-100">
          <p className="text-3xl font-semibold text-black">Please Log In</p>
        </main>
      </div>
    </HydrateClient>
  );
}
