"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Bell, CircleUserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

// redux
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { logoutAsync, protectedRouteAsync } from "@/state/API/ApiSlice";

interface User {
  UserId: string;
  name: string;
  email: string;
  phone?: number;
  isSeller?: boolean;
}

const Nav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [location, setLocation] = useState(pathname);
  const [isClicked, setIsClicked] = useState(false);
  const handleProfileButton = () => {
    setIsClicked(!isClicked);
  };

  const { user, loading, initialized } = useSelector(
    (state: RootState) => state.api,
  );

  const handleLogout = async () => {
    // Implement logout functionality here
    await dispatch(logoutAsync());
  };

  useEffect(() => {
    dispatch(protectedRouteAsync());
  }, [dispatch]);

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  useEffect(() => {
    setLocation(pathname);
  }, [pathname]);

  // useEffect(() => {
  //   const loadUser = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await dispatch(protectedRouteAsync()).unwrap();
  //       console.log("protectedRoute response:", response);
  //       setUserInfo(response);
  //     } catch (err: any) {
  //       console.log("failed to load protected route:", err);
  //       // show a friendly message (err may be an object)
  //       alert(err?.message || JSON.stringify(err) || "Failed to load user");
  //       router.push("/login");
  //       setUserInfo(null);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadUser();
  // }, [dispatch]);

  return (
    <nav
      className={`flex ${
        !user && "hidden"
      } justify-between items-center py-8 px-16 border border-gray-300 drop-shadow-2xl bg-white
    `}
    >
      <h1 className="font-bold text-3xl text-[rgb(56,177,151)]">
        Easy<span className="text-gray-800">Buy</span>
      </h1>
      <h1 className="text-xl">Hello {user?.name}</h1>
      <div className="flex items-center gap-10 text-lg font-semibold">
        <Link
          href=""
          className={`hover:text-[rgb(56,177,151)] ${
            location === "/profile" && "text-[rgb(56,177,151)]"
          }`}
        >
          <div className="relative flex flex-col">
            <button className="" onClick={handleProfileButton}>
              <CircleUserRound />
            </button>
            <div
              className={`absolute flex flex-col mt-4 w-56  bg-white border border-gray-300 p-4 text-black text-black rounded shadow-lg transition-opacity left-[-570%] top-[50] ${
                isClicked ? " " : "hidden"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-600 flex justify-center items-center border border-teal-600 text-white text-semibold rounded-full">
                  {user?.name.charAt(0)}
                </div>
                <p>{user?.name}</p>
              </div>
              <div className=" border border-gray-600 "></div>
              <button
                className="bg-gray-900 hover:bg-gray-700 text-white py-2 px-5 mt-3"
                onClick={() => {
                  handleLogout();
                  // router.push("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
