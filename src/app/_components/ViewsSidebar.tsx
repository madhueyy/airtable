import React from "react";
import { PiGridNineThin } from "react-icons/pi";
import { HiOutlinePlus } from "react-icons/hi2";

function ViewsSidebar() {
  return (
    <div className="absolute bottom-0 left-0 z-2 flex h-[85%] w-[16%] flex-col justify-between border-r border-gray-300 bg-white px-4 py-4 shadow">
      <div>
        <button className="flex w-full cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-2 text-sm font-medium hover:bg-blue-200">
          <PiGridNineThin /> Grid view
        </button>
      </div>

      <div className="space-y-4">
        <hr className="w-full text-gray-200"></hr>
        <button className="flex w-full cursor-pointer items-center justify-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white">
          <HiOutlinePlus />
          Create
        </button>
      </div>
    </div>
  );
}

export default ViewsSidebar;
