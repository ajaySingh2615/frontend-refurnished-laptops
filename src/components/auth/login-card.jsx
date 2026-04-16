"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleSignIn } from "./google-sign-in";
import { PhoneOtpForm } from "./phone-otp-form";
import { Laptop } from "lucide-react";

export function LoginCard() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Laptop className="h-6 w-6" />
        </div>
        <CardTitle className="font-[family-name:var(--font-dm-sans)] text-xl">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-sm">
          Sign in to access your account and start shopping
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <GoogleSignIn />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            or continue with phone
          </span>
          <Separator className="flex-1" />
        </div>

        <PhoneOtpForm />
      </CardContent>
    </Card>
  );
}
