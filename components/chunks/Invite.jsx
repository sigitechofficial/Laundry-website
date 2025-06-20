import React from "react";
import { GoArrowUp, GoClock } from "react-icons/go";
import InputField from "../InputHeroUi";
import { ButtonYouth70018 } from "../Buttons";

export default function Invite() {
  return (
    <section className="w-full mt-16 px-10">
      <div className="w-full">
        <div className="w-full h-[370px]">
          <img
            className="w-full h-full object-cover"
            src="/images/invite/invite.png"
            alt=""
          />
        </div>

        <div className="w-full max-w-[767px] mx-auto font-sf mt-10 space-y-6">
          <h4 className="font-youth font-medium text-[40px] leading-[30px]">
            Refer a Friend
          </h4>

          <p className="text-theme-psGray">
            Get a 10$ referral bonus for every friend you invite
          </p>

          <p className="font-semibold">Personal Link</p>

          <div className="w-full h-[56px] rounded-lg px-2 bg-inputBg text-theme-gray-2 flex justify-between items-center">
            <p>https:///s/templates?query=justdrycleaners+post</p>

            <p className="text-theme-blue cursor-pointer">Copy link</p>
          </div>

          <p className="font-semibold">Send as email invite</p>

          <div className="w-full flex gap-5">
            <InputField type="text" label="email" />
            <div className="w-[306px]">
              <ButtonYouth70018 text="Send email" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
