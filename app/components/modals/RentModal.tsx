"use client";

import useRentModal from "@/app/hooks/useRentModal";
import Modal from "./Modal";
import { useMemo, useState } from "react";
import Heading from "../Heading";
import { categories } from "../Navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import CountrySelect from "../inputs/LocationSelect";
import dynamic from "next/dynamic";
import Counter from "../inputs/Counter";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

function RentModal() {
  const RentModal = useRentModal();
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
      category: "",
      location: null,
      roomCount: 1,
      guestCount: 1,
      imageSrc: [],
      price: 1,
      title: "",
      description: "",
    },
  });

  const category = watch("category");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const imageSrc = watch("imageSrc");
  const title = watch("title");
  const description = watch("description");
  const price = watch("price");

  const Map = useMemo(  
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    [location]
  );

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
      case STEPS.LOCATION:
        if (!location) {
          toast.error("Please select a location.");
          return false;
        }
        break;
      case STEPS.INFO:
        if (!["car", "Bike", "cycle", "Tools"].includes(category)) {
          if (guestCount < 1 || roomCount < 1) {
            toast.error("Please provide valid guest and room counts.");
            return false;
          }
        }
        break;
      case STEPS.IMAGES:
        if (!imageSrc || imageSrc.length !== 5) {
          const remaining = 5 - (imageSrc?.length || 0);
          toast.error(
            `Please upload exactly 5 images. ${remaining > 0 ? `${remaining} more required.` : ""}`
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
        if (!price || price <= 0) {
          toast.error("Please provide a valid price.");
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

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    if (isLoading) return;

    setIsLoading(true);

    const fixedData = {
      ...data,
      imageSrc: Array.isArray(data.imageSrc) ? data.imageSrc : [data.imageSrc],
    };

    axios
      .post("/api/listings", fixedData)
      .then(() => {
        toast.success("Listing created!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        RentModal.onClose();
      })
      .catch((error) => {
        console.error("Error creating listing:", error.response?.data || error.message);
        toast.error("Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return isLoading ? "Creating..." : "Create";
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
        <Heading title="What best describes your rental?" subtitle="Pick a category" />
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

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find your location!"
        />
        <CountrySelect
          value={location}
          onChange={(value) => setCustomValue("location", value)}
        />
        <Map center={location?.latlng} />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-3">
        <Heading
          title="Provide some key details about your rental"
          subtitle="What features or amenities does your rental offer?"
        />
        {["car", "Bike"].includes(category) ? (
          <>
            <Counter
              title="Mileage"
              subtitle="Kilometers per liter?"
              value={guestCount}
              onChange={(value) => setCustomValue("guestCount", value)}
            />
            <hr />
            <Counter
              title="Number of seats"
              subtitle="How many seats do you have?"
              value={roomCount}
              onChange={(value) => setCustomValue("roomCount", value)}
            />
          </>
        ) : (
          <>
            <Counter
              title="Guests"
              subtitle="How many guests do you allow?"
              value={guestCount}
              onChange={(value) => setCustomValue("guestCount", value)}
            />
            <hr />
            <Counter
              title="Rooms"
              subtitle="How many rooms do you have?"
              value={roomCount}
              onChange={(value) => setCustomValue("roomCount", value)}
            />
          </>
        )}
      </div>
    );
  }
  

  if (step === STEPS.IMAGES) {
    console.log('Images')
    bodyContent = (
      <div className="flex flex-col gap-3">
        <Heading
          title="Add a photo of your rental"
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
          title="How would you describe your place?"
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
          title="Now, set your price"
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
      isOpen={RentModal.isOpen}
      onClose={RentModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      title="List Your Rental"
      body={bodyContent}
      disabled={isLoading}
    />
  );
}

export default RentModal;
