"use client";
import { AiFillGithub } from "react-icons/ai";
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

    const registalModel = useRegisterModal();
    const loginModal = useLoginModal();

    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        console.log(data);

        setIsLoading(true);

        signIn("credentials", {
            ...data,
            redirect: false,
        }).then(async (callback) => {
            setIsLoading(false);
            console.log(callback);
            if (callback?.ok) {
                try {
                    await axios.post("/api/auth/jwtCreation", { email: data.email });
                } catch (error) {
                    console.log(error);
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
    };
    const toggle = useCallback(() => {
        loginModal.onClose();
        registalModel.onOpen();
    }, [loginModal, registalModel]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title="welcome back" subtitle="login to your account!" />
            <Input id="email" disabled={isLoading} register={register} errors={errors} required label={"Email"} />

            <Input id="password" disabled={isLoading} register={register} errors={errors} required label={"Password"} />
        </div>
    );
    const footerContent = (
        <div className="flex flex-col gap-4 mt-3">
            <hr />
            <Button outline label="Continue with Google" icon={FcGoogle} onClick={() => signIn("google")} />
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
    );
    return (
        <Modal
            disabled={isLoading}
            isOpen={loginModal.isOpen}
            title="Login"
            actionLabel="Continue"
            onClose={loginModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
}

export default LoginModal;
