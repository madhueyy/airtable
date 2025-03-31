"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Modal to create new base
function Modal({ isOpen, onClose }: ModalProps) {
  const router = useRouter();

  const [baseName, setBaseName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createBase = api.base.createBase.useMutation();
  const createTable = api.table.createTable.useMutation();

  if (!isOpen) return null;

  const handleCreateBase = async () => {
    setIsLoading(false);
    if (!baseName) return;

    try {
      const { id } = await createBase.mutateAsync({ name: baseName });
      await createTable.mutateAsync({ baseId: id });
      router.push(`/base/${id}`);
    } catch (error) {
      console.log(error);
    }

    setIsLoading(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20">
      <div className="w-[400px] rounded bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Create New Base</h2>

        <form>
          <input
            type="text"
            placeholder="Base name"
            value={baseName}
            className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
            onChange={(e) => setBaseName(e.target.value)}
          ></input>
        </form>

        <div className="flex justify-between">
          <button
            className="cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="text-md cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white disabled:bg-blue-600/50"
            onClick={handleCreateBase}
            disabled={!baseName || isLoading}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
