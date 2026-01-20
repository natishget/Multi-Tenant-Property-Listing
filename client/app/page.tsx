// import Image from "next/image";
"use client";

import PropertyCard from "@/compoenents/cards/PropertyCard";
import { useEffect } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  getAllPublishedProperty,
  protectedRouteAsync,
} from "@/state/API/ApiSlice";
import { useRouter } from "next/navigation";

export default function Home() {
  // for redux
  const dispatch = useDispatch<AppDispatch>();

  const router = useRouter();
  const {
    user,
    loading,
    initialized,
    Property: properties = [],
  } = useSelector((state: RootState) => state.api);

  useEffect(() => {
    dispatch(protectedRouteAsync());
    dispatch(getAllPublishedProperty());
  }, [dispatch]);

  if (!initialized && loading) {
    return (
      <div className="flex w-screen h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user?.role === "owner") {
    router.replace("/property");
  }

  return (
    <div className="h-fit w-screen bg-gray-150">
      {/* Products*/}
      <div className="mx-16 mt-10 flex gap-10 flex-wrap">
        {/* Product card*/}
        {properties.map((property, index) => (
          <PropertyCard property={property} key={index} />
        ))}
      </div>
    </div>
  );
}
