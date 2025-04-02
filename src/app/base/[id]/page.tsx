"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Table from "~/app/_components/table";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { BsThreeDots } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";

type Table = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  baseId: string;
};

function Page() {
  const id = useParams().id as string;
  const router = useRouter();

  const { data: base, error } = api.base.getBaseName.useQuery({ id });
  const { data: tables } = api.table.getTables.useQuery({ id });
  const createTable = api.table.createTable.useMutation();
  const editTable = api.table.editTableName.useMutation();
  const deleteTable = api.table.deleteTable.useMutation();

  const [allTables, setAllTables] = useState<Table[] | undefined>([]);
  const [currTable, setCurrTable] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState("");

  // Adds a new table to allTables and sends request to add new table
  // to database
  const handleCreateTable = async () => {
    try {
      // Send request to db
      const newTable = await createTable.mutateAsync({ baseId: id });

      // Add new table to allTables and change current tab to be the
      // new table
      setAllTables((prevTables) =>
        prevTables ? [...prevTables, newTable] : [newTable],
      );
      setCurrTable(newTable.id);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setAllTables(tables);
    setCurrTable(tables?.[0]?.id ?? null);
  }, [tables]);

  const handleTableChange = (tableId: string) => {
    setCurrTable(tableId);
  };

  const openDropwdown = (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => (prev === tableId ? null : tableId));
  };

  const handleEditName = (
    tableId: string,
    currentName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    console.log("okokok " + tableId);
    setEditingTableId(tableId);
    setEditTableName(currentName);
  };

  const handleSaveEdit = async () => {
    if (editingTableId) {
      await editTable.mutateAsync({ id: editingTableId, name: editTableName });

      setAllTables((prevBases) =>
        prevBases?.map((table) =>
          table.id === editingTableId
            ? { ...table, name: editTableName }
            : table,
        ),
      );

      setEditingTableId(null);
      setDropdownOpen(null);
    }
  };

  const handleDeleteTable = async (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    await deleteTable.mutateAsync({ id: tableId });

    setAllTables((prevTables) =>
      prevTables?.filter((table) => table.id !== tableId),
    );

    // Move selected table tab to be the first table after deleting
    setCurrTable(tables?.[0]?.id ?? null);
  };

  return (
    <div>
      {/* Navbar */}
      <div className="mb-auto flex flex-row items-center gap-x-4 bg-teal-600 px-4 py-3">
        <img
          src="/Airtable_Logo_white.png"
          className="w-8 cursor-pointer"
          onClick={() => router.push("/home")}
        />

        {/* Base name */}
        {error ? (
          <p className="text-lg text-white">{error.message}</p>
        ) : (
          <p className="text-lg text-white">{base?.name}</p>
        )}
      </div>

      {/* Tables tabs */}
      <div className="flex flex-row items-center bg-teal-700 px-4 pt-1">
        {allTables?.map(
          ({ id: tableId, name }: { id: string; name: string }) => (
            <div key={tableId}>
              <div
                className={`flex cursor-pointer items-center gap-x-2 rounded-t px-4 py-1 ${currTable === tableId ? "bg-white" : "bg-teal-700 text-white hover:bg-teal-800"}`}
                onClick={() => handleTableChange(tableId)}
              >
                {editingTableId === tableId ? (
                  <input
                    type="text"
                    value={editTableName}
                    onChange={(e) => setEditTableName(e.target.value)}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="w-full"
                  />
                ) : (
                  <p>{name}</p>
                )}

                <BsThreeDots onClick={(e) => openDropwdown(tableId, e)} />
              </div>

              {dropdownOpen === tableId && (
                <div className="absolute z-1 cursor-pointer rounded border border-gray-300 bg-white shadow-sm">
                  <ul className="text-md text-gray-700">
                    <li
                      className="flex items-center gap-x-2 px-2 py-1 hover:bg-blue-100"
                      onClick={(e) => handleEditName(tableId, name, e)}
                    >
                      <MdEdit />
                      <p className="text-black">Rename Table</p>
                    </li>

                    <li
                      className="flex items-center gap-x-2 px-2 py-1 hover:bg-red-100"
                      onClick={(e) => handleDeleteTable(tableId, e)}
                    >
                      <IoTrashOutline />
                      <p className="text-black">Delete Table</p>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ),
        )}

        <button
          className="cursor-pointer rounded-t bg-teal-700 px-4 py-1 text-white hover:bg-teal-800"
          onClick={handleCreateTable}
        >
          +
        </button>
      </div>

      <div className="h-[100vh] w-[100vw] bg-gray-100">
        {currTable && <Table tableId={currTable} />}
      </div>
    </div>
  );
}

export default Page;
