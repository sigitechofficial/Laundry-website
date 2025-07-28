"use client";
import React, { useState } from "react";
import InputHeroUi from "../../../../components/InputHeroUi";
import {
  ButtonContinueWith,
  ButtonYouth70018,
} from "../../../../components/Buttons";
import SelectHero from "../../../../components/SelectHero";
import { InputOtp } from "@heroui/react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
} from "../../../../utilities/firebase";
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
import { CountDown } from "../../../../utilities/CountDown";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import Header from "../../../../components/Header";
import { MiniLoader } from "../../../../components/Loader";

export default function page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userLogin, { isLoading, isError, isSuccess }] = useUserLoginMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [verifyOTP] = useVerifyOTPMutation();
  const [resendOTP] = useResendOTPMutation();
  const [changePasswordReset] = useChangePasswordResetMutation();
  const [registerUser] = useRegisterUserMutation();
  const [verifyOTPRegister] = useVerifyOTPRegisterMutation();
  const { secondsLeft, isActive, startCountdown } = CountDown(60);
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

  let devToken = "";
  if (typeof window !== "undefined") {
    devToken = localStorage.getItem("devToken");
  }

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
    // console.log(data?.format, "value");
    console.log(data?.format?.match(/\./g)?.length, "value");

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
          dvToken: devToken,
        }).unwrap();

        if (res?.status === "1") {
          localStorage.removeItem("otpId");
          localStorage.removeItem("type");
          localStorage.setItem("loginStatus", "true");
          localStorage.setItem("stripeCustomerId", res.data.stripeCustomerId);
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
          localStorage.setItem("email", res?.data?.email);
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
          description: err?.error,
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
        startCountdown();
      } else {
        addToast({
          title: "Reset Password",
          description: res?.error,
          color: "danger",
        });
      }
    }
  };

  const VerifyOtp = async (e) => {
    e.preventDefault();
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
      startCountdown();
    } else {
      addToast({
        title: "Resend OTP",
        description: res?.error,
        color: "danger",
      });
    }
  };

  const handleVerifyOtpRegister = async (e) => {
    e.preventDefault();
    let res = await verifyOTPRegister({
      userId: localStorage.getItem("userId"),
      otpId: localStorage.getItem("otpId"),
      OTP: otp,
      dvToken: devToken,
    }).unwrap();

    if (res?.status === "1") {
      localStorage.setItem("loginStatus", true);
      localStorage.setItem("userId", res?.data?.userId);
      localStorage.setItem("email", res?.data?.email);
      localStorage.removeItem("type");
      localStorage.removeItem("otpId");
      clearAll();
      addToast({
        title: "Resend OTP",
        description: res?.message,
        color: "success",
      });
      dispatch(setPage(true));
      router.push("/");
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
        description: !register?.password
          ? "Enter password"
          : "Enter confirm password",
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
        dvToken: devToken,
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
        startCountdown();
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
      console.log("🚀 ~ handleGoogleLogin ~ user:", user);

      const response = await fetch(BASE_URL + "customer/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          password: "",
          signedFrom: "google",
          dvToken: devToken,
        }),
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
        <div className="grid lg:grid-cols-2">
          <div className="h-[300px] max-sm:hidden sm:h-[600px] lg:h-screen w-full lg:bg-sign-in bg-cover bg-center bg-no-repeat relative">
            <video
              src="/images/signInVideo.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              className="w-full h-full object-cover object-center lg:hidden"
            ></video>

            <div className="w-full max-w-[565px] mx-auto my-auto absolute bottom-5 left-1/2 -translate-x-1/2 lg:hidden">
              <div className="mx-auto w-max pb-1 sm:pb-4">
                <p className="font-sf sm:text-xl font-medium text-theme-blue">
                  Welcome to
                </p>
                <h4 className="font-youth font-bold text-2xl sm:text-[40px] leading-8 text-theme-blue">
                  Just Dry Cleaners
                </h4>
              </div>
              <Link onClick={() => dispatch(setPage(true))} href="/">
                <img
                  className="mx-auto w-12 sm:w-auto"
                  src="/images/logo.png"
                  alt="logo"
                />
              </Link>
            </div>

            <div className="w-full h-14 flex justify-center items-center absolute -bottom-14 left-0 px-8 bg-theme-gray lg:hidden">
              <p className="max-w-[565px] font-sf text-xs sm:text-base">
                Create an account and start enjoying cleaner clothes with zero
                effort!
              </p>
            </div>
          </div>
          <div className="w-full sm:hidden">
            <Header type="sign-in" />
          </div>

          <div className="w-full h-screen lg:overflow-auto flex justify-center lg:items-center px-5 sm:px-8 sm:pad-y">
            {step === "sign-in" ? (
              <div className="w-full max-w-[565px] mx-auto sm:my-auto sm:py-10">
                <Link onClick={() => dispatch(setPage(true))} href="/">
                  <img
                    className="mx-auto cursor-pointer max-lg:hidden"
                    src="/images/logo.png"
                    alt="logo"
                  />
                </Link>

                <div className="mx-auto w-max pt-3 max-lg:hidden">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <h4 className="font-youth font-bold text-2xl pt-5 text-theme-blue sm:hidden">
                  Welcome Back!
                </h4>

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

                <div className="font-sf my-6 space-y-2 sm:my-10 flex flex-col items-center">
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

                <div className="w-full space-y-5 pt-8 sm:pt-12 max-sm:pb-10">
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
              <div className="w-full h-max max-w-[565px] mx-auto py-10 overflow-y-auto sm:my-auto">
                <img
                  className="mx-auto max-lg:hidden"
                  src="/images/logo.png"
                  alt="logo"
                />

                <div className="mx-auto w-max pt-3 max-lg:hidden">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <form className="space-y-3 sm:space-y-5 pt-12 font-sf">
                  <h4 className="font-semibold text-2xl sm:text-[32px] sm:pb-4">
                    Forgot your password?
                  </h4>
                  <p className="font-sf text-lg sm:font-medium text-theme-gray-2/65 leading-tight">
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
              <div className="w-full max-w-[565px] mx-auto py-10 overflow-y-auto my-auto">
                <Link onClick={() => dispatch(setPage(true))} href="/">
                  <img
                    className="mx-auto cursor-pointer max-lg:hidden"
                    src="/images/logo.png"
                    alt="logo"
                  />
                </Link>

                <div className="mx-auto w-max pt-3 max-lg:hidden">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <div className="space-y-5 sm:pt-12 font-sf">
                  <p className="font-sf text-base text-theme-gray-2/75 max-lg:hidden">
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
                          return "Last name must be at least 3 characters long";
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

                  <div className="space-y-3 flex flex-col items-center max-lg:pb-8">
                    <p className="font-sf text-base text-theme-gray-2 text-center leading-tight">
                      Already have an account?
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
              <div className="w-full max-w-[565px] mx-auto pt-8 sm:my-auto overflow-x-hidden">
                <div className="mx-auto w-full">
                  <h4 className="font-youth font-bold text-2xl sm:text-[32px] text-center">
                    Verify your email
                  </h4>
                  <p className="font-sf sm:text-2xl text-theme-gray-2 text-center leading-tight py-3 sm:py-5">
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

                <div className="space-y-4 w-full font-sf">
                  <div className="pt-2">
                    <ButtonYouth70018
                      text="Continue"
                      onClick={(e) =>
                        localStorage.getItem("type") === "register"
                          ? handleVerifyOtpRegister(e)
                          : VerifyOtp(e)
                      }
                    />
                  </div>

                  {isActive ? (
                    <h6 className="font-sf text-lg font-semibold text-gray-500 text-center">
                      Resend code in {secondsLeft}
                    </h6>
                  ) : (
                    <h6
                      onClick={handleResendOtp}
                      className="font-sf text-lg font-semibold text-theme-blue text-center cursor-pointer"
                    >
                      Resend code
                    </h6>
                  )}
                </div>
              </div>
            ) : step === "password" ? (
              <div className="w-full max-w-[565px] mx-auto sm:my-auto pt-12">
                <Link
                  className="max-lg:hidden"
                  onClick={() => dispatch(setPage(true))}
                  href="/"
                >
                  <img className="mx-auto" src="/images/logo.png" alt="logo" />
                </Link>

                <div className="mx-auto w-max pt-3 max-lg:hidden">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <form className="space-y-5 sm:pt-12 font-sf">
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
              <MiniLoader />
            ) : (
              ""
            )}
          </div>
        </div>
      </HomeClientWrapper>
    </>
  );
}
