"use client";
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { getOwnerProperties } from "@/state/API/ApiSlice";

import OwnerPropertyCard from "@/compoenents/cards/OwnerPropertyCard";
import AddPropertyDialog from "@/compoenents/dialog/AddPropertyDialog";

const PropertyPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { Property } = useSelector((state: RootState) => state.api);

  const properties = Array.isArray(Property) ? Property : [];

  useEffect(() => {
    dispatch(getOwnerProperties());
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
    </div>
  );
};

export default PropertyPage;
