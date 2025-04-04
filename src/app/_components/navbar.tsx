"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { MdLogout } from "react-icons/md";
import { MdLogin } from "react-icons/md";
import { useRouter } from "next/navigation";
import { IoIosSearch } from "react-icons/io";
import { GoBell } from "react-icons/go";

function Navbar({
  userName,
  userImage,
}: {
  userName: string | null | undefined;
  userImage: string | null | undefined;
}) {
  const router = useRouter();

  return (
    <div className="mb-auto flex flex-row items-center justify-between border-b border-gray-300 bg-white px-4 py-3 drop-shadow-sm">
      <img src="/Airtable_Logo.svg" className="w-26" />

      <div className="flex w-[18%] items-center gap-x-2 rounded-full border border-gray-300 px-4 py-2 shadow">
        <IoIosSearch className="text-black" size={18} />
        <div className="text-sm text-gray-500">Search...</div>
      </div>

      {userName ? (
        <div className="flex items-center gap-x-4">
          <button className="cursor-pointer rounded-full bg-white px-2 py-2 shadow hover:bg-gray-200">
            <GoBell />
          </button>

          {userName && (
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-500">
              <p className="text-lg text-white">{userName.slice(0, 1)}</p>
            </div>
          )}

          <button
            className="flex cursor-pointer items-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
            onClick={() => signOut()}
          >
            Sign out
            <MdLogout />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-x-4">
          <p className="text-md text-center text-black">Please log in</p>

          <button
            className="flex cursor-pointer items-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
            onClick={() => router.push("/sign-in")}
          >
            Log in
            <MdLogin />
          </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;
