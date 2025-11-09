"use client";

import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "~/components/Layouts/AuthLayout";
import Input from "~/components/Inputs/Input";
import { validateEmail } from "~/utils/helper";
import axiosInstance from "~/utils/axiosInstance";
import { API_PATHS } from "~/utils/apiPaths";
import { UserContext } from "~/context/UserContext";

interface User {
  _id: string;
  email: string;
  fullName: string;
  username: string;
  profileImageUrl?: string;
}

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  const context = useContext(UserContext);
  if (!context) {
    throw new Error("LoginForm must be used within a UserProvider");
  }
  const { updateUser } = context;
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    // Email Validation
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Password Validation
    if (!password) {
      setPasswordError("Please enter a password.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    setServerError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { data } = response.data as { data: { user: User; accessToken: string; refreshToken: string } };

      if (data.user) {
        const userWithId = { ...data.user, id: data.user._id };
        updateUser(userWithId);
        router.push("/dashboard");
      }
    } catch (error: any) {
      setServerError(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />
          {emailError && <p className="text-red-500 text-xs mb-2">{emailError}</p>}

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 Characters"
            type="password"
          />
          {passwordError && <p className="text-red-500 text-xs mb-2">{passwordError}</p>}

          {serverError && <p className="text-red-500 text-xs pb-2.5">{serverError}</p>}

          <button type="submit" className="btn-primary">
            LOGIN
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-primary underline" href="/signup">
              SignUp
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
