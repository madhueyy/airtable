"use client";

import React, { useEffect, useState } from "react";
import Navbar from "~/app/_components/navbar";
import Sidebar from "../_components/sidebar";
import { useSession } from "next-auth/react";
import Modal from "../_components/modal";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { BsThreeDots } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";

type Base = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
};

function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [allBases, setAllBases] = useState<Base[] | undefined>([]);

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editBaseName, setEditBaseName] = useState("");

  const { data: bases, error } = api.base.getBases.useQuery();
  const editBase = api.base.editBaseName.useMutation();
  const deleteBase = api.base.deleteBase.useMutation();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    setAllBases(bases);
  }, [bases]);

  const openBaseModal = () => {
    setIsBaseModalOpen(true);
  };

  const closeBaseModal = () => {
    setIsBaseModalOpen(false);
  };

  const openDropwdown = (baseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => (prev === baseId ? null : baseId));
  };

  const handleEditName = (
    baseId: string,
    currentName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingBaseId(baseId);
    setEditBaseName(currentName);
  };

  const handleSaveEdit = async () => {
    if (editingBaseId) {
      await editBase.mutateAsync({ id: editingBaseId, name: editBaseName });

      setAllBases((prevBases) =>
        prevBases?.map((base) =>
          base.id === editingBaseId ? { ...base, name: editBaseName } : base,
        ),
      );

      setEditingBaseId(null);
      setDropdownOpen(null);
    }
  };

  const handleDeleteBase = async (baseId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    await deleteBase.mutateAsync({ id: baseId });

    setAllBases((prevBases) => prevBases?.filter((base) => base.id !== baseId));
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
              {allBases?.map((base) => (
                <div
                  key={base.id}
                  className="flex w-64 cursor-pointer flex-col items-start justify-between gap-2 rounded-lg border border-gray-300 bg-white p-4 shadow hover:shadow-md"
                  onClick={(e) => {
                    if (editingBaseId !== base.id) {
                      router.push(`/base/${base.id}`);
                    } else {
                      e.stopPropagation();
                    }
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    {editingBaseId === base.id ? (
                      <input
                        type="text"
                        value={editBaseName}
                        onChange={(e) => setEditBaseName(e.target.value)}
                        onBlur={handleSaveEdit}
                        autoFocus
                        className="w-full"
                      />
                    ) : (
                      <p className="text-md font-medium">{base.name}</p>
                    )}

                    <BsThreeDots onClick={(e) => openDropwdown(base.id, e)} />
                  </div>

                  {/* Dropdown */}
                  {dropdownOpen === base.id && (
                    <div className="absolute z-1 mt-6 ml-24 cursor-pointer rounded border border-gray-300 bg-white shadow-sm">
                      <ul className="text-md text-gray-700">
                        <li
                          className="flex items-center gap-x-2 px-2 py-1 hover:bg-blue-100"
                          onClick={(e) => handleEditName(base.id, base.name, e)}
                        >
                          <MdEdit />
                          <p className="text-black">Rename Base</p>
                        </li>

                        <li
                          className="flex items-center gap-x-2 px-2 py-1 hover:bg-red-100"
                          onClick={(e) => handleDeleteBase(base.id, e)}
                        >
                          <IoTrashOutline />
                          <p className="text-black">Delete Base</p>
                        </li>
                      </ul>
                    </div>
                  )}

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
