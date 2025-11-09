"use client";

import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "~/components/Layouts/AuthLayout";
import Input from "~/components/Inputs/Input";
import { validateEmail } from "~/utils/helper";
import { API_PATHS } from "~/utils/apiPaths";
import axiosInstance from "~/utils/axiosInstance";
import { UserContext } from "~/context/UserContext";

interface User {
  _id: string;
  email: string;
  fullName: string;
  username: string;
  profileImageUrl?: string;
}

const SignUpForm = () => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // field-level errors
  const [fullNameError, setFullNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // global/API error
  const [error, setError] = useState("");

  // used to trigger live re-validation after first submit
  const [submitted, setSubmitted] = useState(false);

  const context = useContext(UserContext);
  if (!context) {
    throw new Error("SignUpForm must be used within a UserProvider");
  }
  const { updateUser } = context;
  const router = useRouter();

  // Regex rules
  const nameRegex = /^[A-Za-z ]+$/;                 // alphabets + spaces
  const usernameRegex = /^[A-Za-z0-9]+$/;           // alphanumeric only
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; // 1 lower, 1 upper, 1 number, 1 special, min 8

  // small helpers
  const runFullNameValidation = (val: string) => {
    if (!val) return "Please enter your name.";
    if (!nameRegex.test(val)) return "Full name can only contain alphabets and spaces.";
    return "";
  };
  const runUsernameValidation = (val: string) => {
    if (!val) return "Please enter a username.";
    if (!usernameRegex.test(val)) return "Username can only contain alphabets and numbers (no spaces).";
    return "";
  };
  const runEmailValidation = (val: string) => {
    if (!val) return "Please enter an email address.";
    if (!validateEmail(val)) return "Please enter a valid email address.";
    return "";
  };
  const runPasswordValidation = (val: string) => {
    if (!val) return "Please enter the password.";
    if (!passwordRegex.test(val))
      return "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.";
    return "";
  };

  // Handle Sign Up Form Submit
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    // run validations
    const fErr = runFullNameValidation(fullName);
    const uErr = runUsernameValidation(username);
    const eErr = runEmailValidation(email);
    const pErr = runPasswordValidation(password);

    setFullNameError(fErr);
    setUsernameError(uErr);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (fErr || uErr || eErr || pErr) return;

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName,
        username,
        email,
        password,
      });

      const { data } = response.data as {
        data: { user: User; accessToken: string; refreshToken: string };
      };

      if (data?.user) {
        const userWithId = { ...data.user, id: data.user._id };
        updateUser(userWithId);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const maybeAxios = err as { response?: { data?: { message?: string } } };
      if (maybeAxios?.response?.data?.message) {
        setError(maybeAxios.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  // Re-validate a field after first submit when user edits it
  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (submitted) setFullNameError(runFullNameValidation(val));
  };
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (submitted) setUsernameError(runUsernameValidation(val));
  };
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (submitted) setEmailError(runEmailValidation(val));
  };
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (submitted) setPasswordError(runPasswordValidation(val));
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1 col-span-1">
              <Input
                value={fullName}
                onChange={({ target }) => handleFullNameChange(target.value)}
                label="Full Name"
                placeholder="John Doe"
                type="text"
              />
              {fullNameError && (
                <p className="text-red-500 text-xs">{fullNameError}</p>
              )}
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1 col-span-1">
              <Input
                value={username}
                onChange={({ target }) => handleUsernameChange(target.value)}
                label="Username"
                placeholder="johndoe"
                type="text"
              />
              {usernameError && (
                <p className="text-red-500 text-xs">{usernameError}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1 col-span-2">
              <Input
                value={email}
                onChange={({ target }) => handleEmailChange(target.value)}
                label="Email Address"
                placeholder="john@example.com"
                type="text"
              />
              {emailError && (
                <p className="text-red-500 text-xs">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 col-span-2">
              <Input
                value={password}
                onChange={({ target }) => handlePasswordChange(target.value)}
                label="Password"
                placeholder="Min 8 Characters"
                type="password"
              />
              {passwordError && (
                <p className="text-red-500 text-xs">{passwordError}</p>
              )}
            </div>
          </div>

          {/* Global/API error */}
          {error && <p className="text-red-500 text-xs pb-2.5 mt-2">{error}</p>}

          <button type="submit" className="btn-primary mt-2">
            SIGN UP
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" href="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUpForm;
