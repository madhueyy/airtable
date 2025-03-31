"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Table from "~/app/_components/table";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

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

  const [allTables, setAllTables] = useState<Table[] | undefined>([]);
  const [currTable, setCurrTable] = useState<string | null>(null);

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
    setCurrTable(tables?.[0]?.id || null);
  }, [tables]);

  const handleTableChange = (tableId: string) => {
    setCurrTable(tableId);
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
            <div
              key={tableId}
              className={`cursor-pointer rounded-t px-4 py-1 ${currTable === tableId ? "bg-white" : "bg-teal-700 text-white hover:bg-teal-800"}`}
              onClick={() => handleTableChange(tableId)}
            >
              {name}
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

      {/* Searching and sorting buttons */}
      <div className="flex flex-row items-center justify-center gap-x-4 border-b border-gray-300 bg-white px-4 py-2">
        <p>Searching and sorting buttons go here</p>
      </div>

      <div className="h-[100vh] w-[100vw] bg-gray-100">
        {currTable && <Table tableId={currTable} />}
      </div>
    </div>
  );
}

export default Page;
