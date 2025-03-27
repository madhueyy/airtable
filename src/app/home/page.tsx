"use client";

import React, { useState } from "react";
import Navbar from "~/app/_components/navbar";
import Sidebar from "../_components/sidebar";
import { useSession } from "next-auth/react";
import Modal from "../_components/modal";

function page() {
  const { data: session } = useSession();
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);

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

          <p className="mt-10">Recent bases</p>
        </div>
      </main>

      <Modal isOpen={isBaseModalOpen} onClose={closeBaseModal} />
    </div>
  );
}

export default page;
