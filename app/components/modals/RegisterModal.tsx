"use client"
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import Modal from "./Modal";
import axios from "axios";
import toast from "react-hot-toast";
import Heading from "../Heading";
import Input from "../inputs/Input";
import Button from "../Button";
import { signIn } from "next-auth/react";
import useLoginModal from "@/app/hooks/useLoginModal";

function RegisterModal() {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
  
    axios
      .post("/api/register", data)
      .then((response) => {
        // Display success toast for 5 seconds
        toast.success(response.data.message || "Email verification was sent.", {
          duration: 5000, // 5 seconds
        });
        registerModal.onClose();
      })
      .catch((error) => {
        // Display error toast for 5 seconds
        toast.error(
          error.response?.data?.error || "Something went wrong. Please try again.",
          {
            duration: 5000, // 5 seconds
          }
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  

  const toggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [loginModal, registerModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Welcome to RentalMall" subtitle="Create an account!" />
      <Input
        id="email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        label={"Email"}
      />
      <Input
        id="name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        label={"Name"}
      />
      <Input
        id="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        label={"Password"}
      />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <Button
        outline
        label="Continue with Google"
        icon={FcGoogle}
        onClick={() => signIn("google")}
      />
      <Button
        outline
        label="Continue with Github"
        icon={AiFillGithub}
        onClick={() => signIn("github")}
      />
      <div className="text-neutral-500 text-center mt-4 font-light">
        <div className="justify-center flex flex-row items-center gap-2">
          <div>Already have an account?</div>
          <div
            onClick={toggle}
            className="text-neutral-800 cursor-pointer hover:underline"
          >
            Log in
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Register"
      actionLabel="Continue"
      onClose={registerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default RegisterModal;
