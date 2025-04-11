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
import { IoIosArrowDown } from "react-icons/io";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarClicked, setIsSidebarClicked] = useState(false);

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
      <Navbar
        userName={session?.user.name}
        setIsSidebarClicked={setIsSidebarClicked}
      />

      <main className="flex min-h-screen flex-row bg-[#f9fafb]">
        <Sidebar
          openBaseModal={openBaseModal}
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          isSidebarClicked={isSidebarClicked}
        />

        <div className="mt-20 ml-14">
          <p className="cursor-default text-3xl font-semibold text-black">
            Home
          </p>
          <div className="flex flex-row gap-x-4">
            <div className="mt-10 mb-4 flex cursor-pointer flex-row items-center gap-x-2 text-gray-500 hover:text-black">
              Opened by you <IoIosArrowDown />
            </div>
            <div className="mt-10 mb-4 flex cursor-pointer flex-row items-center gap-x-2 text-gray-500 hover:text-black">
              Show bases only <IoIosArrowDown />
            </div>
          </div>
          <p className="mt-2 mb-6 ml-1 cursor-default text-sm font-semibold text-gray-500">
            Past 7 days
          </p>

          {error ? (
            <p>Error: {error.message}</p>
          ) : (
            // Bases
            <div className="ml-1 grid grid-cols-4 gap-x-4 gap-y-4">
              {allBases?.map((base) => (
                <div
                  key={base.id}
                  className="flex w-74 cursor-pointer flex-col items-start justify-between gap-2 rounded-lg border border-gray-300 bg-white p-4 shadow hover:shadow-md"
                  onClick={(e) => {
                    if (editingBaseId !== base.id) {
                      router.push(`/base/${base.id}`);
                    } else {
                      e.stopPropagation();
                    }
                  }}
                >
                  <div className="flex h-full w-full flex-row items-center gap-x-2">
                    <div className="flex h-14 w-19 items-center justify-center rounded-xl border border-teal-800 bg-teal-700 text-2xl text-white">
                      {base.name.slice(0, 2)}
                    </div>

                    <div className="flex w-full flex-col pl-2">
                      <div className="mt-2 mb-1 flex w-full items-center justify-between">
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

                        <BsThreeDots
                          onClick={(e) => openDropwdown(base.id, e)}
                        />
                      </div>

                      <div className="mb-2 text-xs text-gray-600">Base</div>
                    </div>
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
