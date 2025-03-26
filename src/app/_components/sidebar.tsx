"use client";

import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { HiOutlinePlus } from "react-icons/hi2";
import { useState } from "react";

function Sidebar() {
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);

  const openBaseModal = () => {
    setIsBaseModalOpen(true);
  };

  const closeBaseModal = () => {
    setIsBaseModalOpen(false);
  };

  return (
    <div className="flex h-[92vh] w-[20%] flex-col justify-between border-r border-gray-300 bg-white px-4 py-4 drop-shadow-sm">
      <div className="flex flex-col gap-y-2">
        <button className="flex cursor-pointer items-center justify-between rounded-sm px-4 py-2 text-start font-medium hover:bg-gray-400/20">
          Home
          <MdOutlineKeyboardArrowRight />
        </button>
        <button className="flex cursor-pointer items-center justify-between rounded-sm px-4 py-2 text-start font-medium hover:bg-gray-400/20">
          All Workspaces
          <MdOutlineKeyboardArrowRight />
        </button>
      </div>

      <div className="space-y-4">
        <hr className="w-full text-gray-200"></hr>
        <button
          className="flex w-full cursor-pointer items-center justify-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
          onClick={openBaseModal}
        >
          <HiOutlinePlus />
          Create
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
