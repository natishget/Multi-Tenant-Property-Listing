import Image from "next/image";

import { Property } from "@/state/API/ApiSlice";

import EditPropertyDialog from "../dialog/EditPropertyDialog";
import PropertyDeleteAlertDialog from "../dialog/PropertyDeleteAlertDialog";

import { Archive, Eye, EyeClosed, Heart } from "lucide-react";

import { updatePropertyStatusAsync } from "@/state/API/ApiSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const OwnerPropertyCard = ({ property }: { property: Property }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = property.imageUrl.length;

  const handleNextImage = () =>
    setCurrentImageIndex((prev) =>
      totalImages ? (prev + 1) % totalImages : 0,
    );

  const handlePreviousImage = () =>
    setCurrentImageIndex((prev) =>
      totalImages ? (prev - 1 + totalImages) % totalImages : 0,
    );

  useEffect(() => {
    if (totalImages <= 1) return;
    const id = setInterval(handleNextImage, 3000);
    return () => clearInterval(id);
  }, [totalImages]);

  const handleStatusChange = async () => {
    try {
      const response = await dispatch(
        updatePropertyStatusAsync({
          propertyId: property.id,
          status:
            property.status === "published" || property.status === "archived"
              ? "draft"
              : "published",
        }),
      ).unwrap();
    } catch (err: any) {
      console.log("Error updating property status:", err);
    }
  };

  return (
    <div
      className={`border border-gray-100 bg-white md:w-[500px] w-[400px] shadow-2xl rounded-xl text-lg text-gray-800 ${property.status === "draft" ? "border-b-6 border-b-yellow-500" : property.status === "published" ? "border-b-6 border-green-600" : "border-b-6 border-gray-600"}`}
      key={property.id}
    >
      <div>
        <div className="w-full relative">
          <button
            onClick={() => handlePreviousImage()}
            className="absolute  h-full flex justify-center  items-center w-[20%] text-black text-3xl font-extrabold top-0 left-0 rounded-l-xl hover:cursor-pointer hover:bg-white hover:opacity-60"
          >
            <ChevronLeft className="" />
          </button>
          <Image
            src={property?.imageUrl[currentImageIndex] || "/placeholder.jpg"}
            alt="property image"
            className="rounded-xl object-cover aspect-ratio w-full h-[300px]"
            width={300}
            height={100}
          />
          <button
            onClick={() => handleNextImage()}
            className="absolute  h-full flex justify-center  items-center w-[20%] text-black text-3xl font-extrabold top-0 right-0 rounded-r-xl hover:cursor-pointer hover:bg-white hover:opacity-60"
          >
            <ChevronRight className="" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-5">
          <p className=" pl-3">
            Title: <span className="text-gray-500">{property.title}</span>
          </p>
          <div className="flex gap-2 justify-center items-center mr-3">
            {property._count.favorites}
            <Heart className="text-red-600" />
          </div>
        </div>
        <h1 className="  pl-3">
          Price: <span className="text-gray-500">{property.price}</span>
        </h1>

        <p className="pl-3 ">
          Location: <span className="text-gray-500">{property.location}</span>
        </p>

        <p className="pl-3 ">
          Description: <br />{" "}
          <span className="text-gray-500">{property.description}</span>
        </p>
        <div className="flex justify-end m-3 gap-4 text-xs">
          <button
            className={`px-2 py-2 text-white font-bold bg-[rgb(56,177,151)] rounded ${property?.status === "draft" ? "bg-yellow-500" : property?.status === "published" ? "bg-green-600" : "bg-gray-600"}`}
            onClick={() => handleStatusChange()}
          >
            {property.status === "published" ? (
              <Eye />
            ) : property.status === "draft" ? (
              <EyeClosed />
            ) : (
              <Archive />
            )}
          </button>
          <button className="px-2 py-2 text-white font-bold bg-[rgb(56,177,151)] rounded ">
            <EditPropertyDialog property={property} />
          </button>
          <button
            className={`px-2 py-2 text-white font-bold bg-red-700 rounded ${property.status === "archived" && "hidden"}`}
          >
            <PropertyDeleteAlertDialog propertyId={property.id} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerPropertyCard;
