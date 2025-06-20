import React from "react";

export default function CategoryCard({ bg, h, p, Icon, src, right, onClick }) {
  return (
    <>
      <div
        onClick={onClick}
        className={`rounded-xl w-full h-[264px] flex relative overflow-hidden cursor-pointer ${
          bg === "1"
            ? "bg-bgAvailable"
            : bg === "2"
            ? "bg-card-dark-orange"
            : bg === "3"
            ? "bg-card-green"
            : bg === "4"
            ? "bg-card-pink"
            : bg === "5"
            ? "bg-card-light-orange"
            : bg
        }`}
      >
        <div className="px-5 py-4 h-full">
          <div className="flex items-center gap-x-3">
            <div className="bg-white rounded-full shrink-0 size-10 flex justify-center items-center">
              <Icon size="25" />
            </div>

            <p className="font-youth font-bold text-2xl">{h}</p>
          </div>

          <p className="font-sf text-base pt-[22px] max-w-[342px]">
            From delicate fabrics to everyday wear, our washing service ensures
            your clothes stay fresh and vibrant
          </p>

          <div className="font-sf absolute bottom-4 left-5">
            <p className="text-xl text-black/60">Pricing per weight</p>
            <p className="font-medium">
              $17.880 <span className="text-black/60">/6kg</span>
            </p>
          </div>
        </div>

        <div className={`absolute top-0 ${right} h-full`}>
          <img className="h-full object-contain" src={src} alt="" />
        </div>
      </div>
    </>
  );
}
