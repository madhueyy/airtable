"use client";

import { useParams } from "next/navigation";
import React from "react";
import Table from "~/app/_components/table";

function Page() {
  const { id } = useParams();

  return (
    <div>
      {/* Navbar */}
      <div className="mb-auto flex flex-row items-center justify-between border-b border-gray-300 bg-white px-4 py-3 drop-shadow-sm">
        <img src="/Airtable_Logo.svg" />
        <p>{id}</p>
      </div>

      <button className="rounded bg-blue-500 px-4 py-2 text-white">
        Create new table
      </button>

      <Table />
    </div>
  );
}

export default Page;
