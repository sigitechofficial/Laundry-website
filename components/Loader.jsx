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

export function BouncingBallsLoader() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce-ball {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `
      }} />
      <div className="flex items-center justify-center gap-1.5">
        <div 
          className="w-2.5 h-2.5 bg-white rounded-full"
          style={{
            animation: 'bounce-ball 0.6s ease-in-out infinite',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="w-2.5 h-2.5 bg-white rounded-full"
          style={{
            animation: 'bounce-ball 0.6s ease-in-out infinite',
            animationDelay: '0.2s'
          }}
        ></div>
        <div 
          className="w-2.5 h-2.5 bg-white rounded-full"
          style={{
            animation: 'bounce-ball 0.6s ease-in-out infinite',
            animationDelay: '0.4s'
          }}
        ></div>
      </div>
    </>
  );
}