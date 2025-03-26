"use client";
import { AiFillGithub, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import Modal from "./Modal";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Heading from "../Heading";
import Input from "../inputs/Input";
import Button from "../Button";
import { useRouter } from "next/navigation";
import axios from "axios";

function LoginModal() {
  const router = useRouter();
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (isForgotPassword) {
      setIsLoading(true);
      try {
        await axios.post("/api/forgot-password", { email: data.email });
        toast.success("Password reset email sent. Check your inbox!");
        setIsForgotPassword(false);
        reset();
      } catch (error) {
        toast.error("Failed to send reset email. Try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      signIn("credentials", {
        ...data,
        redirect: false,
      }).then(async (callback) => {
        setIsLoading(false);
        if (callback?.ok) {
          try {
            await axios.post("/api/auth/jwtCreation", { email: data.email });
          } catch (error) {
            console.error(error);
          }
          toast.success("Logged in");
          router.refresh();
          loginModal.onClose();
        }
        if (callback?.error) {
          if (callback.error === "Your account has been blocked by the admin.") {
            toast.error("You are blocked by the admin. Please contact support.");
          } else {
            toast.error(callback.error);
          }
        }
      });
    }
  };

  const toggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title={isForgotPassword ? "Reset Your Password" : "Welcome back"}
        subtitle={isForgotPassword ? "Enter your email to receive a reset link" : "Login to your account!"}
      />
      <Input
        id="email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        label="Email"
      />
      {!isForgotPassword && (
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            label="Password"
          />
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
          </div>
        </div>
      )}
      {!isForgotPassword && (
        <div
          className="text-neutral-500 text-sm cursor-pointer hover:underline"
          onClick={() => setIsForgotPassword(true)}
        >
          Forgot Password?
        </div>
      )}
    </div>
  );

  function handleGoogleLogin() {
    signIn("google");
  }

  const footerContent = !isForgotPassword ? (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <Button outline label="Continue with Google" icon={FcGoogle} onClick={handleGoogleLogin} />
      <Button outline label="Continue with Github" icon={AiFillGithub} onClick={() => signIn("github")} />
      <div className="text-neutral-500 text-center mt-4 font-light">
        <div className="justify-center flex flex-row items-center gap-2">
          <div>First time using RentalMall?</div>
          <div onClick={toggle} className="text-neutral-800 cursor-pointer hover:underline">
            Create an account!
          </div>
        </div>
      </div>
    </div>
  ) : undefined;

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title={isForgotPassword ? "Forgot Password" : "Login"}
      actionLabel={isForgotPassword ? "Send Reset Link" : "Continue"}
      onClose={() => {
        setIsForgotPassword(false);
        loginModal.onClose();
      }}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default LoginModal;