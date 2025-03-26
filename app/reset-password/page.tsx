"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CardWrapper from "@/app/components/auth/card-wrapper";
import { FormSuccess } from "@/app/components/auth/form-sucess";
import { FormError } from "@/app/components/auth/form-error";
import Input from "@/app/components/inputs/Input";
import Button from "@/app/components/Button";
import { FieldValues, useForm } from "react-hook-form";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      await axios.post("/api/reset-password", {
        token,
        password: data.password,
      });
      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => router.push("/"), 3000); // Redirect to login after 3 seconds
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <CardWrapper
        headerLabel="Invalid Reset Link"
        title="Error"
        backButtonHref="/"
        backButtonLabel="Back to login"
      >
        <FormError message="No token provided. Please request a new reset link." />
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      headerLabel="Reset Your Password"
      title="Enter your new password"
      backButtonHref="/"
      backButtonLabel="Back to login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="password"
          type="password"
          disabled={loading}
          register={register}
          errors={errors}
          required
          label="New Password"
        />
        <Input
          id="confirmPassword"
          type="password"
          disabled={loading}
          register={register}
          errors={errors}
          required
          label="Confirm Password"
        />
        <Button disabled={loading} label="Reset Password" type="submit" />
        {loading && <p>Loading...</p>}
        {success && <FormSuccess message={success} />}
        {error && <FormError message={error} />}
      </form>
    </CardWrapper>
  );
}