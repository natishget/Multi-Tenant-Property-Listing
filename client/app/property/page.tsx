"use client";
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { getOwnerProperties } from "@/state/API/ApiSlice";

import OwnerPropertyCard from "@/compoenents/cards/OwnerPropertyCard";
import AddPropertyDialog from "@/compoenents/dialog/AddPropertyDialog";

const PropertyPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { Property, ownerMeta } = useSelector((state: RootState) => state.api);
  console.log("Owner Meta:", ownerMeta);

  const properties = Array.isArray(Property) ? Property : [];

  useEffect(() => {
    dispatch(getOwnerProperties({ page: 1 }));
  }, [dispatch]);

  return (
    <div className="w-screen h-fit bg-gray-150 p-16">
      <div className="flex justify-end ">
        <AddPropertyDialog />
      </div>
      <div className="flex flex-wrap gap-5  mt-10 ">
        {properties.map((property, index) => (
          <OwnerPropertyCard key={index} property={property} />
        ))}
      </div>
      <div className="w-full flex flex-col items-center mt-10">
        <p className="mt-10 text-gray-600">
          Total Properties: {ownerMeta.totalItems}
        </p>
        <div className="mt-2">
          {Array.from(
            { length: ownerMeta.totalPages || 0 },
            (_, i) => i + 1,
          ).map((page) => (
            <button
              key={page}
              onClick={() => dispatch(getOwnerProperties({ page }))}
              className={`mx-1 px-3 py-1 border border-blue-500 text-blue-500 rounded-md ${ownerMeta.page === page ? "bg-blue-500 text-white" : ""}`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
