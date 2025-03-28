"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { MdLogout } from "react-icons/md";
import { MdLogin } from "react-icons/md";
import { useRouter } from "next/navigation";

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

      {userName ? (
        <div className="flex items-center gap-x-4">
          <p className="text-md text-center text-black">
            Logged in as {userName}
          </p>
          {userImage && (
            <img
              src={userImage}
              alt="User's profile picture"
              className="w-8 rounded-full"
            ></img>
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
