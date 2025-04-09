import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { PiGridNineThin } from "react-icons/pi";
import { HiOutlinePlus } from "react-icons/hi2";

type View = {
  id: string;
  name: string;
  tableId: string;
};

function ViewsSidebar({
  tableId,
  activeViewId,
  setActiveViewId,
}: {
  tableId: string;
  activeViewId: string | undefined;
  setActiveViewId: (viewId: string) => void;
}) {
  const [views, setViews] = useState<View[] | undefined>([]);
  const [newViewName, setNewViewName] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data, refetch } = api.view.getViewsByTable.useQuery({ tableId });
  const createView = api.view.createView.useMutation();

  useEffect(() => {
    setViews(data);
  }, [data]);

  const handleCreateView = async () => {
    setIsLoading(true);
    if (!newViewName) return;

    try {
      await createView.mutateAsync({ tableId: tableId, viewName: newViewName });
    } catch (error) {
      console.log(error);
    }

    await refetch();

    setOpenCreate(false);
    setIsLoading(false);
  };

  return (
    <div className="absolute bottom-0 left-0 z-2 flex h-[83.8vh] w-[16%] flex-col justify-between border-r border-gray-300 bg-white px-4 py-4 shadow">
      <div>
        {views?.map((view) => (
          <button
            key={view.id}
            className={`flex w-full cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-2 text-sm font-medium ${activeViewId === view.id ? "bg-blue-200" : "hover:bg-blue-100"}`}
            onClick={() => setActiveViewId(view.id)}
          >
            <PiGridNineThin className="text-blue-500" />
            {view.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <hr className="w-full text-gray-200"></hr>
        <button
          className="flex w-full cursor-pointer items-center justify-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
          onClick={() => setOpenCreate(true)}
        >
          <HiOutlinePlus />
          Create
        </button>
      </div>

      {openCreate && (
        <div className="fixed bottom-18 left-72 flex items-center justify-center">
          <div className="w-[400px] rounded bg-white p-6 drop-shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Create New View</h2>

            <form>
              <input
                type="text"
                value={newViewName}
                placeholder="View name"
                className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
                onChange={(e) => setNewViewName(e.target.value)}
              ></input>
            </form>

            <div className="flex justify-between">
              <button
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setOpenCreate(false)}
              >
                Cancel
              </button>
              <button
                className="text-md cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white disabled:bg-blue-600/50"
                onClick={handleCreateView}
                disabled={!newViewName || isLoading}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewsSidebar;
