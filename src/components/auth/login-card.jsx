"use client";

import { GoogleSignIn } from "./google-sign-in";
import { PhoneOtpForm } from "./phone-otp-form";

export function LoginCard() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-left">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to continue to your account.
        </p>
      </div>

      <div className="mt-8">
        <GoogleSignIn />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          or with phone
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <PhoneOtpForm />

      <p className="mt-8 text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
