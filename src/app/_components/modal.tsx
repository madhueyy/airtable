import React from "react";

function modal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20">
      <div className="w-[400px] rounded bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Create New Base</h2>

        <form>
          <input
            type="text"
            placeholder="Base name"
            className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
          ></input>
        </form>

        <div className="flex justify-between">
          <button className="cursor-pointer text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button className="text-md cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white disabled:bg-blue-600/50">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default modal;
