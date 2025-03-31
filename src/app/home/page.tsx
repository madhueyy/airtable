"use client";

import React, { useEffect, useState } from "react";
import Navbar from "~/app/_components/navbar";
import Sidebar from "../_components/sidebar";
import { useSession } from "next-auth/react";
import Modal from "../_components/modal";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const { data: bases, error } = api.base.getBases.useQuery();

  const openBaseModal = () => {
    setIsBaseModalOpen(true);
  };

  const closeBaseModal = () => {
    setIsBaseModalOpen(false);
  };

  return (
    <div>
      <Navbar userName={session?.user.name} userImage={session?.user.image} />

      <main className="flex min-h-screen flex-row bg-gray-100">
        <Sidebar openBaseModal={openBaseModal} />

        <div className="mt-8 ml-14">
          <p className="text-3xl font-semibold text-black">Home</p>
          <p className="mt-10 mb-4">Recent bases</p>

          {error ? (
            <p>Error: {error.message}</p>
          ) : (
            // Bases
            <div className="grid grid-cols-4 gap-x-4 gap-y-4">
              {bases?.map((base) => (
                <div
                  key={base.id}
                  className="flex w-64 cursor-pointer flex-col items-start justify-between gap-2 rounded-lg border border-gray-300 bg-white p-4 shadow"
                  onClick={() => router.push(`/base/${base.id}`)}
                >
                  <div className="text-md font-medium">{base.name}</div>
                  <div className="text-xs text-gray-600">Base</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isBaseModalOpen} onClose={closeBaseModal} />
    </div>
  );
}

export default Page;
