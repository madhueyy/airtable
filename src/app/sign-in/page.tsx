"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function Page() {
  const [isValidEmail, setIsValidEmail] = useState(false);

  // Not actually implemented with proper validation
  const checkValidEmail = (email: string) => {
    if (email) {
      setIsValidEmail(true);
    } else {
      setIsValidEmail(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      {/* Logo with sign in text and create account link */}
      <div className="mb-12 flex flex-col items-center justify-center gap-2">
        <img src="/Airtable_Logo.svg" />

        <p className="mt-6 text-2xl font-medium text-black">Sign in</p>
        <p className="text-sm text-black">
          or{" "}
          <Link href="/sign-up" className="text-blue-500 underline">
            create an account
          </Link>
        </p>
      </div>

      {/* Email and password form */}
      <form className="mb-6 flex min-w-[30%] flex-col gap-y-2">
        <label className="text-xl">Email</label>
        <input
          type="email"
          placeholder="Email address"
          className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
          onChange={(e) => checkValidEmail(e.target.value)}
        ></input>

        <button
          className="text-md cursor-pointer rounded-xl bg-blue-600 py-2 text-white disabled:bg-blue-600/50"
          disabled={!isValidEmail}
        >
          Continue
        </button>
      </form>

      <div className="mb-6 flex min-w-[30%] items-center justify-center gap-x-2">
        <hr className="w-[50%] text-gray-400"></hr>
        <p className="text-gray-400">or</p>
        <hr className="w-[50%] text-gray-400"></hr>
      </div>

      {/* Sign in with google button */}
      <button
        className="flex min-w-[30%] items-center justify-center gap-x-2 rounded-2xl border-2 border-gray-300 py-2 text-xl shadow transition hover:border-black hover:bg-black/10"
        onClick={() => signIn("google")}
      >
        <img src="/Google_Logo.webp" className="h-7 w-7" />
        Sign in with Google
      </button>
    </div>
  );
}

export default Page;
