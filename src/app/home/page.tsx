"use client";

import React, { useState } from "react";
import Navbar from "~/app/_components/navbar";
import Sidebar from "../_components/sidebar";
import { useSession } from "next-auth/react";
import Modal from "../_components/modal";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

function page() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);

  const { data: bases, error } = api.base.getBases.useQuery();

  const openBaseModal = () => {
    setIsBaseModalOpen(true);
  };

  const closeBaseModal = () => {
    setIsBaseModalOpen(false);
  };

  return (
    <div>
      <Navbar userEmail={session?.user.email} />

      <main className="flex min-h-screen flex-row bg-gray-100">
        <Sidebar openBaseModal={openBaseModal} />

        <div className="mt-8 ml-14">
          <p className="text-3xl font-semibold text-black">Home</p>
          <p className="mt-10 mb-4">Recent bases</p>

          {error ? (
            <p>Error: {error.message}</p>
          ) : (
            <div className="flex gap-x-4">
              {bases?.map((base) => (
                <div
                  key={base.id}
                  className="flex w-50 cursor-pointer items-center justify-between gap-x-2 rounded border p-4"
                  onClick={() => router.push(`/base/${base.id}`)}
                >
                  <div className="text-lg font-medium">{base.name}</div>
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

export default page;
