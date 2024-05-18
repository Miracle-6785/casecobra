"use client";
import { cn } from "@/lib/utils";
import { CaseColor } from "@prisma/client";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import React, { useEffect, useRef } from "react";

const PhonePreview = ({
  croppedImageUrl,
  color,
}: {
  croppedImageUrl: string;
  color: CaseColor;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  let caseBackgroundColor = `bg-zinc-950`;
  if (color === "blue") caseBackgroundColor = `bg-blue-950`;
  if (color === "rose") caseBackgroundColor = `bg-rose-950`;
  const [renderDimensions, setRenderDimensions] = React.useState({
    height: 0,
    width: 0,
  });

  const handleResize = () => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();

    setRenderDimensions({ width, height });
  };

  useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref.current]);
  return (
    <AspectRatio ref={ref} ratio={3000 / 2001} className="relative">
      <div
        className="absolute z-20 scale-[1.0352]"
        style={{
          left:
            renderDimensions.width / 2 - renderDimensions.width / (1216 / 121),
          top: renderDimensions.height / 6.22,
        }}
      >
        <img
          width={renderDimensions.width / (3000 / 637)}
          src={croppedImageUrl}
          className={cn(
            "phone-skew relative z-20 rounded-t-[15px] rounded-b-[10px] md:rounded-t-[30px] md:rounded-b-[20px]",
            caseBackgroundColor
          )}
          alt="Phone preview"
        />
      </div>
      <div className="relative size-full z-40">
        <img
          src="/clearphone.png"
          alt="phone"
          className="size-full pointer-events-none rounded-md antialiased"
        />
      </div>
    </AspectRatio>
  );
};

export default PhonePreview;
