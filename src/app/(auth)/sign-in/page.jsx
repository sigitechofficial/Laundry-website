"use client";
import React, { useState } from "react";
import InputHeroUi from "../../../../components/InputHeroUi";
import {
  ButtonContinueWith,
  ButtonYouth70018,
} from "../../../../components/Buttons";
import SelectHero from "../../../../components/SelectHero";
import { InputOtp, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider,facebookProvider } from "../../../../utilities/firebase"; 
import {
  useChangePasswordResetMutation,
  useRegisterUserMutation,
  useResendOTPMutation,
  useResetPasswordMutation,
  useUserLoginMutation,
  useVerifyOTPMutation,
  useVerifyOTPRegisterMutation,
} from "@/app/store/services/api";
import { addToast } from "@heroui/react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import PhoneInputComp from "../../../../components/PhoneInputComp";
import HomeClientWrapper from "../../../../utilities/Test";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { BASE_URL } from "../../../../utilities/URL";

export default function page() {
  const router = useRouter();
  const [userLogin, { isLoading, isError, isSuccess }] = useUserLoginMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [verifyOTP] = useVerifyOTPMutation();
  const [resendOTP] = useResendOTPMutation();
  const [changePasswordReset] = useChangePasswordResetMutation();
  const [registerUser] = useRegisterUserMutation();
  const [verifyOTPRegister] = useVerifyOTPRegisterMutation();

  const [step, setStep] = useState("sign-in");
  const [otp, setOtp] = useState("");
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    resetPassword: "",
    confirmPassword: "",
    verficationPending: null,
  });
  const [register, setRegister] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    dvToken: "",
    phoneNum: "",
    countryCode: "",
    email: "",
    profileImage: null,
  });

  const clearAll = () => {
    setUserData({
      email: "",
      password: "",
      resetPassword: "",
      confirmPassword: "",
      verficationPending: null,
    });
    setRegister({
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      dvToken: "",
      phoneNum: "",
      countryCode: "",
      email: "",
      profileImage: null,
    });
  };

  const handlePhoneChange = (value, data) => {
    console.log(value, data, "value, datavalue, datavalue, data");
    setRegister({
      ...register,
      countryCode: data.dialCode,
      phoneNum: value.slice(data.dialCode.length),
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const isValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
      userData?.email
    );

    if (!userData?.email || !isValid) {
      addToast({
        title: "Invalid input value",
        description: isValid
          ? "Email must be filled"
          : "Please enter a valid email address",
        color: "danger",
      });
    } else if (userData?.password === "" || userData?.password?.length < 6) {
      addToast({
        title: "Invalid input value",
        description:
          userData?.password?.length < 6
            ? "Password must be atleast 6 character long"
            : "Please enter the password",
        color: "danger",
      });
    } else {
      try {
        const res = await userLogin({
          email: userData?.email,
          password: userData?.password,
          signedFrom: "",
          dvToken: "gfgfdgbgfhg",
        }).unwrap();

        if (res?.status === "1") {
          localStorage.removeItem("otpId");
          localStorage.removeItem("type");
          localStorage.setItem("loginStatus", "true");
          localStorage.setItem("userId", res.data.userId);
          localStorage.setItem("email", res.data.email);
          localStorage.setItem("phoneNum", res?.data?.phoneNum);
          localStorage.setItem(
            "userName",
            res.data.firstName + " " + res.data.lastName
          );

          setStep("new-order");
          router.replace("/");

          addToast({
            title: "User Login",
            description: "Login successfully",
            color: "success",
          });
        } else if (res?.message === "Pending email verification") {
          localStorage.setItem("userId", res?.data?.userId);
          localStorage.setItem("otpId", res?.data?.otpId);
          localStorage.setItem("email", res.data.email);
          localStorage.setItem("type", "register");
          setUserData({ ...userData, verficationPending: true });
          addToast({
            title: "Login Failed",
            description: res?.error,
            color: "danger",
          });
        } else {
          addToast({
            title: "Login Failed",
            description: res?.error,
            color: "danger",
          });
        }
      } catch (err) {
        addToast({
          title: "Login Failed",
          description: err?.data?.message,
          color: "danger",
        });
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const isValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
      userData?.resetPassword
    );
    if (userData?.resetPassword === "" || !isValid) {
      addToast({
        title: "Forgot Password",
        description: isValid
          ? "Enter email address"
          : "Enter a valid email address",
        color: "danger",
      });
    } else {
      let res = await resetPassword({
        email: userData?.resetPassword,
      }).unwrap();
      if (res?.status === "1") {
        localStorage.setItem("userId", res?.data?.userId);
        localStorage.setItem("type", "forgot");
        localStorage.setItem("otpId", res?.data?.otpid);
        localStorage.setItem("email", userData?.resetPassword);
        addToast({
          title: "Reset Password",
          description: res?.message,
          color: "success",
        });
        setStep("otp");
      } else {
        addToast({
          title: "Reset Password",
          description: res?.error,
          color: "danger",
        });
      }
    }
  };

  const VerifyOtp = async () => {
    let res = await verifyOTP({
      OTP: otp,
      otpId: localStorage.getItem("otpId"),
    }).unwrap();

    if (res?.status === "1") {
      clearAll();
      addToast({
        title: "Verify OTP",
        description: res?.message,
        color: "success",
      });
      setStep("password");
    } else {
      addToast({
        title: "Verify OTP",
        description: res?.error,
        color: "danger",
      });
    }
  };
  const handleResendOtp = async (e) => {
    e.preventDefault();
    let res = await resendOTP({
      userId: localStorage.getItem("userId"),
    }).unwrap();

    if (res?.status === "1") {
      addToast({
        title: "Resend OTP",
        description: res?.message,
        color: "success",
      });
      setStep("otp");
    } else {
      addToast({
        title: "Resend OTP",
        description: res?.error,
        color: "danger",
      });
    }
  };

  const handleVerifyOtpRegister = async () => {
    let res = await verifyOTPRegister({
      userId: localStorage.getItem("userId"),
      otpId: localStorage.getItem("otpId"),
      OTP: otp,
    }).unwrap();

    if (res?.status === "1") {
      clearAll();
      addToast({
        title: "Resend OTP",
        description: res?.message,
        color: "success",
      });
      setStep("sign-in");
    } else {
      addToast({
        title: "Resend OTP",
        description: res?.error,
        color: "danger",
      });
    }
  };

  const handleChangepasswordReset = async () => {
    if (userData?.resetPassword === "") {
      addToast({
        title: "Change password",
        description: "Password field must be filled",
        color: "danger",
      });
    } else if (userData?.confirmPassword === "") {
      addToast({
        title: "Change password",
        description: "Confirm Password field must be filled",
        color: "danger",
      });
    } else if (userData?.resetPassword !== userData?.confirmPassword) {
      addToast({
        title: "Change password",
        description: "Password and confirm password is not same",
        color: "danger",
      });
    } else {
      let res = await changePasswordReset({
        password: userData?.resetPassword,
        otpId: localStorage.getItem("otpId"),
        userId: localStorage.getItem("userId"),
      }).unwrap();

      if (res?.status === "1") {
        clearAll();
        addToast({
          title: "Change password",
          description: res?.message,
          color: "success",
        });
        setStep("sign-in");
      } else {
        addToast({
          title: "Change password",
          description: res?.error,
          color: "danger",
        });
      }
    }
  };

  const handleRegisterChange = (e) => {
    setRegister({ ...register, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    if (!register?.firstName?.trim() || register?.firstName?.length < 3) {
      addToast({
        title: "User Registration",
        description:
          register?.firstName?.length < 3
            ? "Add first name atleast 3 characters long"
            : "First name can't be empty",
        color: "danger",
      });
    } else if (
      !register?.lastName?.trim() ||
      register?.firstName?.lastName < 3
    ) {
      addToast({
        title: "User Registration",
        description:
          register?.lastName?.length < 3
            ? "Add last name atleast 3 characters long"
            : "Last name can't be empty",
        color: "danger",
      });
    } else if (!register?.email?.trim()) {
      addToast({
        title: "User Registration",
        description: "Enter email address",
        color: "danger",
      });
    } else if (
      !validatePhone(
        register.countryCode?.includes("+")
          ? register.countryCode
          : "+" + register.countryCode + register.phoneNum
      )
    ) {
      addToast({
        title: "User Registration",
        description: "Enter valid phone number",
        color: "danger",
      });
    } else if (!register?.password || !register?.confirmPassword) {
      addToast({
        title: "User Registration",
        description: !register?.password ? "Enter password" :"Enter confirm password",
        color: "danger",
      });
    } else if (register?.password !== register?.confirmPassword) {
      addToast({
        title: "User Registration",
        description: "Password and confirm password did not match",
        color: "danger",
      });
    } else {
      let res = await registerUser({
        firstName: register?.firstName,
        lastName: register?.lastName,
        password: register?.password,
        confirmPassword: register?.confirmPassword,
        dvToken: "dfdfdfdfdfd",
        phoneNum: register?.phoneNum,
        countryCode: register?.countryCode?.includes("+")
          ? register?.countryCode
          : "+" + register?.countryCode,
        email: register?.email,
        profileImage: null,
      }).unwrap();

      if (res?.status === "1") {
        localStorage.setItem("otpId", res?.data?.otpId);
        localStorage.setItem("type", "register");
        localStorage.setItem("userId", res?.data?.userId);
        setStep("otp");
        addToast({
          title: "User Registration",
          description: res?.message,
          color: "success",
        });
      } else {
        addToast({
          title: "User Registration",
          description: res?.error,
          color: "danger",
        });
      }
    }
  };

  const validatePhone = (fullPhone) => {
    try {
      const phoneNumber = parsePhoneNumberFromString(
        fullPhone,
        register.countryCode?.includes("+")
          ? register.countryCode
          : "+" + register.countryCode
      );
      return phoneNumber?.isValid() || false;
    } catch {
      return false;
    }
  };


 const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

  
      const idToken = await user.getIdToken();
      console.log("🚀 ~ handleGoogleLogin ~ idToken:", idToken)

  
      const response = await fetch(BASE_URL+"customer/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with backend");
      }

      const data = await response.json();
      console.log("✅ Backend response:", data);

      // Do something with response (e.g., save JWT, redirect)
    } catch (error) {
      console.error("❌ Google Sign-In error:", error);
    }
  };

const handleFacebookLogin = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    console.log("User Info:", result?.user);
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      console.warn("❗ User closed the login popup.");
    } else {
      console.error("❌ Facebook Sign-In error:", error);
    }
  }
};

  return (
    <>
      <HomeClientWrapper>
        <div className="grid grid-cols-2">
          <div className="h-screen w-full bg-sign-in bg-cover bg-center bg-no-repeat"></div>

          <div className="w-full flex justify-center items-center">
            {step === "sign-in" ? (
              <div className="w-full max-w-[565px] mx-auto">
                <img className="mx-auto" src="/images/logo.png" alt="logo" />

                <div className="mx-auto w-max pt-3">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <form className="space-y-5 pt-12 font-sf">
                  <InputHeroUi
                    type="email"
                    label="Email Address"
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    value={userData?.email}
                    validate={(value) => {
                      const validateEmail = (value) =>
                        value.match(
                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
                        );

                      if (!validateEmail(value)) {
                        return "Please enter a valid email address";
                      }

                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />
                  <InputHeroUi
                    type="password"
                    label="Password"
                    value={userData?.password}
                    onChange={(e) =>
                      setUserData({ ...userData, password: e.target.value })
                    }
                    validate={(value) => {
                      if (value.length < 6) {
                        return "Password must be at least 6 characters long";
                      }

                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />
                  <ButtonYouth70018
                    text={userData.verficationPending ? "Send otp" : "Login"}
                    onClick={(e) => {
                      userData.verficationPending
                        ? handleResendOtp(e)
                        : handleLogin(e);
                    }}
                    isDisabled={isLoading}
                    isPending={isLoading}
                  />
                </form>

                <div className="font-sf my-10 flex flex-col items-center">
                  <p
                    onClick={() => setStep("forgot")}
                    className="text-base font-semibold text-theme-brightBlue text-center cursor-pointer"
                  >
                    I forgot my password
                  </p>
                  <p
                    onClick={() => setStep("sign-up")}
                    className="text-base font-medium text-center text-theme-gray-3 cursor-pointer"
                  >
                    Don’t have an account{" "}
                    <span className="text-theme-brightBlue ">? Sign Up</span>
                  </p>
                </div>

                <div className="w-full flex items-center gap-x-2">
                  <p className="bg-theme-gray-2/25 w-full h-[2px]"></p>
                  <p className="text-xs text-theme-gray-3 font-sf">OR</p>
                  <p className="bg-theme-gray-2/25 w-full h-[2px]"></p>
                </div>

                <div className="space-y-5 pt-12">
                  <ButtonContinueWith
                    text="Continue with google"
                    size="18px"
                    src="/images/auth/google.png"
                    onClick={handleGoogleLogin}
                  />
                  <ButtonContinueWith
                    text="Continue with facebook"
                    size="18px"
                    src="/images/auth/facebook.png"
                    onClick={handleFacebookLogin}
                  />
                  <ButtonContinueWith
                    text="Continue with Apple"
                    size="18px"
                    src="/images/auth/email.png"
                  />
                </div>
              </div>
            ) : step === "forgot" ? (
              <div className="w-full max-w-[565px] mx-auto">
                <img className="mx-auto" src="/images/logo.png" alt="logo" />

                <div className="mx-auto w-max pt-3">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <form className="space-y-5 pt-12 font-sf">
                  <h4 className="font-semibold text-[32px] pb-4">
                    Forgot your password?
                  </h4>
                  <p className="font-sf text-lg font-medium text-theme-gray-2/65 leading-tight">
                    Enter your email and we’ll send you instructions for
                    creating a new password
                  </p>
                  <InputHeroUi
                    type="email"
                    label="Email Address"
                    value={userData?.resetPassword}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        resetPassword: e.target.value,
                      })
                    }
                  />

                  <div className="pt-2">
                    <ButtonYouth70018
                      text="Reset password"
                      onClick={handleResetPassword}
                    />
                  </div>

                  <p className="text-base font-medium text-center text-theme-gray-3 pt-4">
                    Don’t have an account{" "}
                    <span
                      onClick={() => setStep("sign-up")}
                      className="text-theme-brightBlue cursor-pointer"
                    >
                      ? Sign Up
                    </span>
                  </p>
                </form>
              </div>
            ) : step === "sign-up" ? (
              <div className="w-full max-w-[565px] mx-auto">
                <img className="mx-auto" src="/images/logo.png" alt="logo" />

                <div className="mx-auto w-max pt-3">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <div className="space-y-5 pt-12 font-sf">
                  <p className="font-sf text-base text-theme-gray-2/75">
                    Create an account and start enjoying cleaner clothes with
                    zero effort!
                  </p>

                  <div className="flex gap-5">
                    <InputHeroUi
                      type="text"
                      label="First Name"
                      name="firstName"
                      value={register?.firstName}
                      onChange={handleRegisterChange}
                      validate={(value) => {
                        if (value.length < 3) {
                          return "First name must be at least 3 characters long";
                        }

                        return value === "admin" ? "Nice try!" : null;
                      }}
                    />
                    <InputHeroUi
                      type="text"
                      label="Last Name"
                      name="lastName"
                      value={register?.lastName}
                      onChange={handleRegisterChange}
                      validate={(value) => {
                        if (value.length < 3) {
                          return "Last name must be at least 6 characters long";
                        }

                        return value === "admin" ? "Nice try!" : null;
                      }}
                    />
                  </div>
                  <InputHeroUi
                    type="email"
                    label="Email Address"
                    name="email"
                    value={register?.email}
                    onChange={handleRegisterChange}
                  />

                  <PhoneInputComp
                    value={register.countryCode + register.phoneNum}
                    onChange={handlePhoneChange}
                    error={
                      register.countryCode &&
                      register.phoneNum &&
                      !validatePhone(
                        register.countryCode?.includes("+")
                          ? register.countryCode
                          : "+" + register.countryCode + register.phoneNum
                      )
                        ? "Invalid phone number"
                        : ""
                    }
                  />
                  <InputHeroUi
                    type="password"
                    label="Password"
                    name="password"
                    value={register?.password}
                    onChange={handleRegisterChange}
                    validate={(value) => {
                      if (value.length < 6) {
                        return "Password must be at least 6 characters long";
                      }

                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />
                  <InputHeroUi
                    type="password"
                    label="Confirm Password"
                    name="confirmPassword"
                    value={register?.confirmPassword}
                    onChange={handleRegisterChange}
                    validate={(value) => {
                      if (value.length < 6) {
                        return "Password must be at least 6 characters long";
                      } else if (
                        register?.confirmPassword !== register?.password
                      ) {
                        return "Password and confirm password is not same";
                      }

                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />

                  <div className="pt-2">
                    <ButtonYouth70018 text="Register" onClick={handleAddUser} />
                  </div>

                  <p className="text-xs text-center font-sf text-theme-gray-3">
                    By creating an account, you agree to Just Dry Cleaners Terms
                    and Privacy Policy.
                  </p>

                  <div className="space-y-3 flex flex-col items-center">
                    <p className="font-sf text-base text-theme-gray-2 text-center leading-tight">
                      Already have an <br /> account?
                    </p>
                    <h6
                      onClick={() => setStep("sign-in")}
                      className="font-youth text-lg font-bold text-theme-gray-2 text-center cursor-pointer"
                    >
                      SIGN IN
                    </h6>
                  </div>
                </div>
              </div>
            ) : step === "otp" ? (
              <div className="w-full max-w-[565px] mx-auto">
                <div className="mx-auto w-max">
                  <h4 className="font-youth font-bold text-[32px] text-center">
                    Verify your email
                  </h4>
                  <p className="font-sf text-2xl text-theme-gray-2 text-center leading-tight py-5">
                    Please enter the 4 digit code <br /> sent to{" "}
                    {localStorage.getItem("email") || ""}
                  </p>
                </div>

                <div className="flex justify-center">
                  <img src="/images/auth/group.png" alt="" />
                </div>

                <div className="flex justify-center w-full py-5">
                  <InputOtp
                    classNames={{
                      wrapper: "flex justify-center", // Center input boxes
                    }}
                    fullWidth
                    size="lg"
                    length={4}
                    value={otp}
                    variant={otp > 0 ? "bordered" : "flat"}
                    onValueChange={setOtp}
                    errorMessage={
                      <div className="text-center">
                        {otp?.length < 4 ? "incomplete otp fields" : " "}
                      </div>
                    }
                  />
                </div>

                <div className="space-y-4  font-sf">
                  <div className="pt-2">
                    <ButtonYouth70018
                      text="Continue"
                      onClick={() =>
                        localStorage.getItem("type") === "register"
                          ? handleVerifyOtpRegister()
                          : VerifyOtp()
                      }
                    />
                  </div>

                  <h6
                    onClick={handleResendOtp}
                    className="font-sf text-lg font-semibold text-theme-blue text-center"
                  >
                    Resend code in 00:30
                  </h6>
                </div>
              </div>
            ) : step === "password" ? (
              <div className="w-full max-w-[565px] mx-auto">
                <img className="mx-auto" src="/images/logo.png" alt="logo" />

                <div className="mx-auto w-max pt-3">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <form className="space-y-5 pt-12 font-sf">
                  <p className="font-sf text-base text-theme-gray-2/75">
                    Create an account and start enjoying cleaner clothes with
                    zero effort!
                  </p>

                  <InputHeroUi
                    type="password"
                    label="Password"
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        resetPassword: e.target.value,
                      })
                    }
                    validate={(value) => {
                      if (value.length < 6) {
                        return "Password must be at least 6 characters long";
                      }

                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />
                  <InputHeroUi
                    type="password"
                    label="Confirm Password"
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        confirmPassword: e.target.value,
                      })
                    }
                    validate={(value) => {
                      if (value.length < 6) {
                        return "Password must be at least 6 characters long";
                      }

                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />

                  <div className="pt-2">
                    <ButtonYouth70018
                      text="Register"
                      onClick={handleChangepasswordReset}
                    />
                  </div>

                  <p className="text-xs text-center font-sf text-theme-gray-3">
                    By creating an account, you agree to Just Dry Cleaners Terms
                    and Privacy Policy.
                  </p>

                  <div className="space-y-3">
                    <p className="font-sf text-base text-theme-gray-2 text-center leading-tight">
                      Already have an <br /> account?
                    </p>
                    <h6
                      onClick={() => {
                        setStep("sign-in");
                      }}
                      className="font-youth text-lg font-bold text-theme-gray-2 text-center cursor-pointer"
                    >
                      SIGN IN
                    </h6>
                  </div>
                </form>
              </div>
            ) : step === "new-order" ? (
              <Spinner
                classNames={{ label: "text-foreground mt-4" }}
                size="lg"
                label="Loading..."
                variant="wave"
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </HomeClientWrapper>
    </>
  );
}
