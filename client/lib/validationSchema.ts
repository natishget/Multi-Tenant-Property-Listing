import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(3, "Name must be atleast 3 Characters"),
    phone: z.string().min(9, "Phone Number must be atleast 9 digits").regex(/^[0-9]+$/, "Phone must contain only numbers"),
    email: z.string().email("Invalid email address"),
    password: z.string()
    .min(6, "password must be atleast 6 characters")
    .regex(/[A-Z]/, "Password must have atleast one Uppercase letter")
    .regex(/[a-z]/, "Password must have atleast one Lowercase letter")
    .regex(/[0-9]/, "Password must atleast have one number")
    .regex(/^[a-zA-Z0-9]/, "Password must have atleast one Special character"),
    confirmPassword: z.string(),
    role: z.enum(["user", "owner", "admin"], { message: "Please select Buyer or Seller" }),
    // isSeller: z.string().refine(val => val === "buyer" || val === "seller", { message: "Please select Buyer of Seller" }).transform(val => val==="seller")
})
.refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string(),
  })

  const imageFiles = z
  .array(
    z
      .instanceof(File)
      .refine((file) => file.type.startsWith("image/"), "File must be an image")
      .refine((file) => file.size <= 1_000_000, "Max size is 1MB per file")
  )
  .min(1, "Atleast one image is required");

export const addProductSchema = z.object({
    title: z.string().min(3, "Title must be atleast 3 Characters"),
    price: z.number().min(1, "Price must be greater than 0"),
    location: z.string().min(3, "Location must be atleast 3 Characters"),
    imageUrl: imageFiles,
    description: z.string().min(10, "Description must be atleast 10 Characters"),
});