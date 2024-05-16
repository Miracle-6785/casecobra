import { db } from "@/db";
import { notFound } from "next/navigation";
import React from "react";
import DesignConfigurator from "./DesignConfigurator";

type PageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

const Page = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;
  // make db call
  if (!id || typeof id !== "string") notFound();

  const configuration = await db.configuration.findUnique({
    where: { id },
  });

  if (!configuration) notFound();

  const { imageUrl, width, height } = configuration;

  return (
    <DesignConfigurator
      configId={configuration.id}
      imageUrl={imageUrl}
      imageDimensions={{ width, height }}
    ></DesignConfigurator>
  );
};

export default Page;
