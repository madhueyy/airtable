"use client";

import { useParams } from "next/navigation";
import React from "react";
import Table from "~/app/_components/table";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

function Page() {
  const id = useParams().id as string;
  const router = useRouter();

  const { data: base, error } = api.base.getBaseName.useQuery({ id });

  return (
    <div>
      {/* Navbar */}
      <div className="mb-auto flex flex-row items-center gap-x-4 bg-teal-600 px-4 py-2">
        <img
          src="/Airtable_Logo_white.png"
          className="w-8 cursor-pointer"
          onClick={() => router.push("/home")}
        />

        {error ? (
          <p className="text-lg text-white">Loading...</p>
        ) : (
          <p className="text-lg text-white">{base?.name}</p>
        )}
      </div>

      {/* Tables tabs */}
      <div className="flex flex-row items-center gap-x-4 bg-teal-700 px-4 py-2">
        <div className="rounded bg-white px-4 py-1">Table 1</div>
        <button className="rounded bg-white px-4 py-1 text-black">+</button>
      </div>

      {/* Searching and sorting buttons */}
      <div className="flex flex-row items-center justify-center gap-x-4 border-b border-gray-300 bg-white px-4 py-2">
        <p>Searching and sorting buttons go here</p>
      </div>

      <div className="h-[100vh] w-[100vw] bg-gray-100">
        <Table />
      </div>
    </div>
  );
}

export default Page;
