import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { PiGridNineThin } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { BiHide } from "react-icons/bi";
import { IoFilter } from "react-icons/io5";
import { BsCardList } from "react-icons/bs";
import { PiArrowsDownUp } from "react-icons/pi";
import { IoColorFillOutline } from "react-icons/io5";
import { CgFormatLineHeight } from "react-icons/cg";
import { GrShare } from "react-icons/gr";
import { IoIosArrowUp } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

/* Searching and sorting buttons */
function TableTopBar({
  searchInput,
  setSearchInput,
  highlightedCellsCount = 0,
  currHighlightIndex = 0,
  onNextHighlight,
  onPrevHighlight,
}: {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  highlightedCellsCount?: number;
  currHighlightIndex?: number;
  onNextHighlight?: () => void;
  onPrevHighlight?: () => void;
}) {
  const [searchIsOpen, setSearchIsOpen] = useState(false);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="flex flex-row items-center justify-between gap-x-4 bg-white px-4 py-2">
      {/* Filter, sort, view etc. buttons */}
      <div className="flex flex-row items-center gap-x-2">
        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
          <GiHamburgerMenu className="text-gray-500" />
          <p>Views</p>
        </div>

        <div className="mx-2 h-[18px] w-[1px] bg-black/30"></div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 font-medium hover:bg-gray-100">
          <PiGridNineThin className="text-xl text-blue-500" />
          <p className="text-sm">Grid view</p>
          <HiOutlineUserGroup />
          <IoIosArrowDown />
        </div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
          <BiHide className="text-gray-600" />
          <p>Hide Fields</p>
        </div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
          <IoFilter className="text-gray-500" />
          <p>Filter</p>
        </div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
          <BsCardList className="text-gray-600" />
          <p>Group</p>
        </div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
          <PiArrowsDownUp className="text-gray-600" />
          <p>Sort</p>
        </div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
          <IoColorFillOutline className="text-gray-600" />
          <p>Colour</p>
        </div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 font-medium hover:bg-gray-100">
          <CgFormatLineHeight className="text-gray-600" />
        </div>

        <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 font-medium hover:bg-gray-100">
          <GrShare className="text-xs text-gray-600" />
          <p className="text-sm">Share and Sync</p>
        </div>
      </div>

      {/* Search */}
      <IoIosSearch
        className="mr-4 cursor-pointer text-gray-500"
        size={20}
        onClick={() => setSearchIsOpen((prev) => !prev)}
      />

      {searchIsOpen && (
        <div className="absolute right-2 z-2 mt-32 border border-gray-300 shadow">
          <div className="flex h-10 flex-row items-center bg-white px-2">
            <input
              type="text"
              value={searchInput}
              placeholder="Find in view"
              className="text-sm font-medium focus:outline-none"
              onChange={handleSearchChange}
            ></input>
            <div className="flex flex-row gap-x-2">
              <p className="text-xs text-gray-400">
                {highlightedCellsCount > 0
                  ? `${currHighlightIndex + 1} of ${highlightedCellsCount}`
                  : "0 found"}
              </p>
              <div className="flex flex-row">
                <IoIosArrowDown
                  className="cursor-pointer rounded-xs bg-gray-300 p-1"
                  onClick={onNextHighlight}
                />
                <IoIosArrowUp
                  className="cursor-pointer rounded-xs bg-gray-300 p-1"
                  onClick={onPrevHighlight}
                />
              </div>
              <RxCross2
                className="cursor-pointer text-gray-400"
                onClick={() => setSearchIsOpen(false)}
              />
            </div>
          </div>

          <div className="flex h-10 items-center bg-[#f2f2f2] px-2">
            <p className="text-sm text-gray-600">ok</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableTopBar;
