import React from "react";
import { GoArrowUp, GoClock } from "react-icons/go";

export default function Notifications() {
  return (
    <section className="w-full mt-16 sm:px-6 lg:px-10">
      <h2 className="font-youth font-medium text-[40px] mb-4">
        Activity Alerts
      </h2>

      <div className="w-full max-w-[912px] font-sf space-y-5 border rounded-2xl overflow-hidden shadow-theme-shadow pt-4">
        <div className="flex justify-between items-center border-b pb-4 px-4">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-full shrink-0 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="/images/sample.jpg"
                alt="image"
              />
            </div>

            <div>
              <h4 className="font-youth font-bold text-xl">Lara Croft</h4>
              <p className="font-sf text-base text-theme-psGray">
                We have encountered an issue with one or more of the items in
                your order.
              </p>
            </div>
          </div>

          <div className="space-y-3 pb-2">
            <p className="text-base text-theme-psGray font-sf">10:30 AM</p>
            <p className="size-4 rounded-full bg-theme-blue-2 ml-auto"></p>
          </div>
        </div>
        <div className="flex justify-between items-center border-b pb-4 px-4">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-full shrink-0 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="/images/sample.jpg"
                alt="image"
              />
            </div>

            <div>
              <h4 className="font-youth font-bold text-xl">Lara Croft</h4>
              <p className="font-sf text-base text-theme-psGray">
                We have encountered an issue with one or more of the items in
                your order.
              </p>
            </div>
          </div>

          <div className="space-y-3 pb-2">
            <p className="text-base text-theme-psGray font-sf">10:30 AM</p>
            <p className="size-4 rounded-full bg-theme-blue-2 ml-auto"></p>
          </div>
        </div>

        <div className="flex justify-between items-center border-b pb-4 px-4">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-full shrink-0 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="/images/sample.jpg"
                alt="image"
              />
            </div>

            <div>
              <h4 className="font-youth font-bold text-xl">Lara Croft</h4>
              <p className="font-sf text-base text-theme-psGray">
                We have encountered an issue with one or more of the items in
                your order.
              </p>
            </div>
          </div>

          <div className="space-y-3 pb-2">
            <p className="text-base text-theme-psGray font-sf">10:30 AM</p>
            <p className="size-4 rounded-full bg-theme-blue-2 ml-auto"></p>
          </div>
        </div>
      </div>
    </section>
  );
}
