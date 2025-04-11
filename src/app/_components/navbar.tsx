"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { MdLogout } from "react-icons/md";
import { MdLogin } from "react-icons/md";
import { useRouter } from "next/navigation";
import { IoIosSearch } from "react-icons/io";
import { GoBell } from "react-icons/go";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoHelpCircleOutline } from "react-icons/io5";

function Navbar({
  userName,
  setIsSidebarClicked,
}: {
  userName: string | null | undefined;
  setIsSidebarClicked: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();

  return (
    <div className="absolute top-0 left-0 z-1 mb-auto flex w-[100vw] flex-row items-center justify-between border-b border-gray-300 bg-white px-4 py-2.5 drop-shadow-xs">
      <div className="flex flex-row items-center gap-x-4">
        <RxHamburgerMenu
          className="cursor-pointer text-gray-500 hover:text-black"
          size={18}
          onClick={() => setIsSidebarClicked((prev) => !prev)}
        />
        <img
          src="/Airtable_Logo.svg"
          className="w-26 cursor-pointer"
          onClick={() => router.push("/home")}
        />
      </div>

      <div className="flex w-[20%] cursor-pointer items-center gap-x-2 rounded-full border border-gray-300 px-4 py-1.5 shadow">
        <IoIosSearch className="text-black" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="text-sm text-gray-500 focus:outline-none"
        ></input>
        <div className="ml-auto text-sm text-gray-400">ctrl K</div>
      </div>

      {userName ? (
        <div className="flex items-center gap-x-4">
          <button className="flex cursor-pointer flex-row items-center gap-x-1 rounded-full px-3 py-1 text-sm hover:bg-gray-200">
            <IoHelpCircleOutline />
            Help
          </button>
          <button className="cursor-pointer rounded-full bg-white px-2 py-2 shadow hover:bg-gray-200">
            <GoBell size={14} />
          </button>

          {userName && (
            <div className="flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-full bg-purple-500">
              <p className="text-sm text-white">{userName.slice(0, 1)}</p>
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
