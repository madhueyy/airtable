"use client";

import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { HiOutlinePlus } from "react-icons/hi2";
import { GoHome } from "react-icons/go";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { LuBookOpen } from "react-icons/lu";
import { PiShoppingBagOpenLight } from "react-icons/pi";
import { CiGlobe } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { TfiImport } from "react-icons/tfi";

type SidebarProps = {
  openBaseModal: () => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  isSidebarClicked: boolean;
};

function Sidebar({
  openBaseModal,
  setIsSidebarOpen,
  isSidebarOpen,
  isSidebarClicked,
}: SidebarProps) {
  return (
    <div>
      {isSidebarOpen || isSidebarClicked ? (
        <div
          className="flex h-[100vh] w-76 flex-col justify-between border-r border-gray-300 bg-white px-2 pt-16 pb-4 transition-all"
          onMouseLeave={() => setIsSidebarOpen(false)}
        >
          <div className="flex flex-col gap-y-2">
            <button className="flex cursor-pointer items-center justify-between rounded-sm px-4 py-2 text-start font-medium hover:bg-gray-400/20">
              Home
              <MdOutlineKeyboardArrowRight />
            </button>
            <button className="flex cursor-pointer items-center justify-between rounded-sm px-4 py-2 text-start font-medium hover:bg-gray-400/20">
              All Workspaces
              <div className="flex flex-row items-center gap-x-4">
                <FaPlus size={14} />
                <MdOutlineKeyboardArrowRight />
              </div>
            </button>
          </div>

          <div className="flex flex-col items-center gap-y-1">
            <hr className="mb-3 w-[88%] text-gray-200"></hr>
            <button className="flex w-full cursor-pointer items-center justify-start gap-x-2 rounded-sm px-4 py-1.5 text-sm hover:bg-gray-400/20">
              <LuBookOpen />
              Templates and apps
            </button>
            <button className="flex w-full cursor-pointer items-center justify-start gap-x-2 rounded-sm px-4 py-1.5 text-sm hover:bg-gray-400/20">
              <PiShoppingBagOpenLight />
              Marketplace
            </button>
            <button className="flex w-full cursor-pointer items-center justify-start gap-x-2 rounded-sm px-4 py-1.5 text-sm hover:bg-gray-400/20">
              <TfiImport />
              Import
            </button>

            <button
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
              onClick={openBaseModal}
            >
              <HiOutlinePlus />
              Create
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex h-[100vh] w-12 flex-col items-center justify-between border-r border-gray-300 bg-[white] px-4 pt-16 pb-4"
          onMouseEnter={() => setIsSidebarOpen(true)}
        >
          <div className="flex flex-col items-center gap-y-4 py-2">
            <GoHome size={20} />
            <HiOutlineUserGroup size={20} />
            <hr className="mt-2 w-6 text-gray-200"></hr>
          </div>

          <div className="flex flex-col items-center gap-y-4">
            <hr className="mb-1 w-6 text-gray-200"></hr>
            <LuBookOpen size={16} className="text-gray-400" />
            <PiShoppingBagOpenLight size={16} className="text-gray-400" />
            <CiGlobe size={16} className="text-gray-400" />
            <button className="rounded border border-gray-300 px-1 py-1">
              <FaPlus size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
