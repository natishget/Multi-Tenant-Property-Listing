"use client";
import React, { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addProductSchema } from "@/lib/validationSchema";

import { z } from "zod";
import Image from "next/image";
import Loading from "@/assests/icons/loading.png";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { addPropertyAsync } from "@/state/API/ApiSlice";

import { Dialog } from "@radix-ui/themes";

type PropertyForm = z.infer<typeof addProductSchema>;

const AddPropertyDialog = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const [error, setError] = useState();

  const onSubmit = async (data: PropertyForm) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("location", data.location);
      formData.append("price", String(data.price));
      formData.append("description", data.description);
      data.imageUrl.forEach((file) => formData.append("files", file));
      formData.append("status", "draft");

      await dispatch(addPropertyAsync(formData)).unwrap();
      setOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to add property");
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PropertyForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: { imageUrl: [] },
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <button className="flex items-center gap-2 bg-black text-white font-bold cursor-pointer p-3 rounded">
          Add Property
        </button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>Add New Property</Dialog.Title>
        <Dialog.Description>
          Please fill in the form below to add a new product.
        </Dialog.Description>
        <div className="w-full mx-auto bg-gray-100 my-20">
          <form
            onSubmit={handleSubmit(onSubmit)}
            action=""
            className="bg-white flex flex-col items-center justify-center w-full"
            encType="multipart/form-data"
          >
            <h1 className="text-4xl font-bold text-gray-800 m-5">
              App Property
            </h1>
            <input
              type="text"
              id="title"
              {...register("title")}
              placeholder="Property Name"
              className="w-[80%] p-5  bg-[rgb(244,248,247)]"
            />{" "}
            <p className="text-red-500">{errors.title?.message}</p>
            <br />
            <input
              type="text"
              {...register("location")}
              id="location"
              placeholder="Location"
              className="w-[80%] p-5  bg-[rgb(244,248,247)]"
            />
            <p className="text-red-500">{errors.location?.message}</p>
            <br />
            <input
              type="file"
              id="imageURL"
              multiple
              accept="image/*"
              onChange={(e) =>
                setValue("imageUrl", Array.from(e.target.files ?? []), {
                  shouldValidate: true,
                })
              }
              className="w-[80%] p-5  bg-[rgb(244,248,247)]"
            />{" "}
            <p className="text-red-500">{errors.imageUrl?.message}</p>
            <br />
            <input
              type="number"
              id="price"
              {...register("price", { valueAsNumber: true })}
              placeholder="Price"
              className="w-[80%] p-5  bg-[rgb(244,248,247)]"
            />{" "}
            <p className="text-red-500">{errors.price?.message}</p>
            <br />
            <input
              type="text"
              id="description"
              {...register("description")}
              placeholder="Description"
              className="w-[80%] p-5  bg-[rgb(244,248,247)]"
            />{" "}
            <p className="text-red-500">{errors.description?.message}</p>
            <br />
            <button
              type="submit"
              className="py-4 px-18 bg-[rgb(56,177,151)] rounded-full text-white font-bold text-sm"
            >
              {isLoading ? (
                <Image src={Loading} alt="" className="animate-spin w-6" />
              ) : (
                "Add Property"
              )}
            </button>
            <p className="text-red-500">{error}</p>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AddPropertyDialog;
