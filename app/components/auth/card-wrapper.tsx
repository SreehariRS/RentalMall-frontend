"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../../components/ui/card";
import AuthHeader from "../auth/auth-heaer";
import { BackButton } from "../auth/back-button";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  title: string;
  showSocial?: boolean;
  backButtonHref: string;
}

const CardWrapper = ({ children, headerLabel, backButtonLabel, backButtonHref, title, showSocial}: CardWrapperProps) => {
  return (
    <Card className="shadow-md w-full">
      <CardHeader>
        <AuthHeader label={headerLabel} title={title} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
