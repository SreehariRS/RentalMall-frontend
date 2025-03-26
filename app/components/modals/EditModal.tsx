"use client";

import { useCallback, useMemo, useState } from "react";
import Modal from "./Modal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Heading from "../Heading";
import { categories } from "../Navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import CountrySelect from "../inputs/LocationSelect";
import dynamic from "next/dynamic";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { safelisting } from "@/app/types";

enum STEPS {
  CATEGORY = 0,
  IMAGES = 1,
  DESCRIPTION = 2,
  PRICE = 3,
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: safelisting;
}

function EditModal({ isOpen, onClose, listing }: EditModalProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      category: listing.category,
      imageSrc: listing.imageSrc,
      title: listing.title,
      description: listing.description,
      price: listing.price,
    },
  });

  const category = watch("category");
  const imageSrc = watch("imageSrc");
  const title = watch("title");
  const description = watch("description");
  const price = watch("price");

  const Map = useMemo(() => dynamic(() => import("../Map"), { ssr: false }), []);

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [isLoading, setIsLoading] = useState(false);

  const validateStep = () => {
    switch (step) {
      case STEPS.CATEGORY:
        if (!category) {
          toast.error("Please select a category.");
          return false;
        }
        break;
      case STEPS.IMAGES:
        if (!imageSrc || imageSrc.length !== 5) {
          const remaining = 5 - (imageSrc?.length || 0);
          toast.error(
            `Please upload exactly 5 images. ${remaining > 0 ? `${remaining} more required.` : "Too many images."}`
          );
          return false;
        }
        break;
      case STEPS.DESCRIPTION:
        if (!title || !description) {
          toast.error("Please provide a title and description.");
          return false;
        }
        break;
      case STEPS.PRICE:
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum <= 0) {
          toast.error("Please provide a valid price greater than 0.");
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    if (validateStep()) {
      setStep((value) => value + 1);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    if (isLoading) return;

    setIsLoading(true);

    const fixedData = {
      ...data,
      imageSrc: Array.isArray(data.imageSrc) ? data.imageSrc : [data.imageSrc],
      price: Number(data.price), // Convert price to a number
    };

    try {
      await axios.put(`/api/listings/${listing.id}`, fixedData);
      toast.success("Listing updated!");
      router.refresh();
      reset();
      setStep(STEPS.CATEGORY);
      onClose();
    } catch (error: any) {
      console.error("Error updating listing:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to update listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return isLoading ? "Updating..." : "Update";
    }
    return "Next";
  }, [step, isLoading]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }
    return "Back";
  }, [step]);

  let bodyContent: React.ReactElement | undefined;

  if (step === STEPS.CATEGORY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Update your rental category" subtitle="Pick a category" />
        <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          {categories.map((item) => (
            <div key={item.label} className="col-span-1">
              <CategoryInput
                onClick={(category) => setCustomValue("category", category)}
                selected={category === item.label}
                label={item.label}
                icon={item.icon}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-3">
        <Heading
          title="Update photos of your rental"
          subtitle="Show guests what your rental looks like!"
        />
        <ImageUpload
          value={imageSrc}
          onChange={(value) => setCustomValue("imageSrc", value)}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Update your rental description"
          subtitle="Short and sweet works best!"
        />
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Update your price"
          subtitle="How much do you charge per day?"
        />
        <Input
          id="price"
          label="Price (₹)"
          formatPrice
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      title="Edit Your Rental"
      body={bodyContent}
      disabled={isLoading}
    />
  );
}

export default EditModal;