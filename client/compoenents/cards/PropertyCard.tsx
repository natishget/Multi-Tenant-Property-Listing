import { useState, useEffect } from "react";
import Image from "next/image";
import { Property, likePropertyAsync } from "@/state/API/ApiSlice";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";

import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

const PropertyCard = ({ property }: { property: Property }) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleLikeProperty = async () => {
    dispatch(likePropertyAsync({ propertyId: property.id }));
  };
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
  return (
    <div
      className="border border-gray-100 bg-white w-[500px] shadow-2xl rounded-xl"
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
        <div className="flex justify-between items-center mt-3">
          <h1 className="mt-3 font-bold pl-3">Price: {property.price}Birr</h1>
          <div className="flex gap-2">
            {property._count.favorites}
            <button onClick={() => handleLikeProperty()}>
              {property.likedByMe ? (
                <Heart className="text-red-600 pr-3 w-10" />
              ) : (
                <Heart className="text-gray-600 pr-3 w-10" />
              )}
            </button>
          </div>
        </div>
        <p className=" pl-3 pt-3">{property.title}</p>
        <p className="text-gray-500 pl-3">Location: {property.location}</p>
        <p className="text-gray-500 pl-3 mb-5">
          Description: {property.description}
        </p>
      </div>
      {/* <AddToCart property={property} position={"horizontal"} /> */}
    </div>
  );
};

export default PropertyCard;
