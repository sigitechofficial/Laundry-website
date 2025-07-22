import { Spinner } from "@heroui/react";
import React from "react";

export default function Loader() {
  return (
    <div className="fixed w-full h-full inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
      <div className="text-xl font-semibold">
        <Spinner
          classNames={{
            label:
              "text-foreground mt-4 font-youth font-semibold text-theme-blue animate-pulse",
          }}
          size="lg"
          label="Loading..."
          variant="wave"
        />
      </div>
    </div>
  );
}

export function MiniLoader() {
  return (
    <div className="text-xl font-semibold font-youth">
      <Spinner
        classNames={{
          label:
            "text-foreground mt-4 font-youth font-semibold text-theme-blue animate-pulse",
        }}
        size="lg"
        label="Loading..."
        variant="wave"
      />
    </div>
  );
}
