"use client";
import React, { useState, useEffect } from "react";
import InputHeroUi from "../../../../components/InputHeroUi";
import {
  ButtonContinueWith,
  ButtonYouth70018,
} from "../../../../components/Buttons";
import SelectHero from "../../../../components/SelectHero";
import { InputOtp } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
  appleProvider,
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
import { requestDeviceToken } from "../../../../utilities/requestFCMToken";
import { FaChevronLeft } from "react-icons/fa";

export default function page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userLogin, { isLoading, isError, isSuccess }] = useUserLoginMutation();
  const [resetPassword, { isLoading: isResetPasswordLoading }] = useResetPasswordMutation();
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
    signedFrom: "", // Track if this is social auth (google, facebook, apple)
  });
  const [googleAuthLoader, setGoogleAuthLoader] = useState(false);
  const [facebookAuthLoader, setFacebookAuthLoader] = useState(false);
  const [appleAuthLoader, setAppleAuthLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [existingProvider, setExistingProvider] = useState("");
  const [pendingCred, setPendingCred] = useState(null);
  const [mergeOtp, setMergeOtp] = useState("");
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [devToken, setDevToken] = useState("");
  
  // Helper function to get device token (from localStorage or Firebase)
  const getDeviceToken = async () => {
    console.log("🔵 getDeviceToken called");
  if (typeof window !== "undefined") {
      // First check if token exists in localStorage
      const storedToken = localStorage.getItem("devToken");
      console.log("🔵 Stored token from localStorage:", storedToken ? "✅ Found" : "❌ Not found");
      
      if (storedToken) {
        console.log("🔵 Using stored token from localStorage");
        setDevToken(storedToken);
        return storedToken;
      } else {
        // If not in localStorage, fetch from Firebase
        console.log("🔵 Token not in localStorage, fetching from Firebase...");
        try {
          // Check notification permission first
          const permission = Notification.permission;
          console.log("🔵 Notification permission:", permission);
          
          if (permission === "denied") {
            console.warn("⚠️ Notification permission denied - cannot get FCM token");
            return "";
          }
          
          if (permission === "default") {
            console.log("🔵 Requesting notification permission...");
            const newPermission = await Notification.requestPermission();
            console.log("🔵 Notification permission result:", newPermission);
            
            if (newPermission !== "granted") {
              console.warn("⚠️ Notification permission not granted - cannot get FCM token");
              return "";
            }
          }
          
          console.log("🔵 Calling requestDeviceToken()...");
          const token = await requestDeviceToken();
          console.log("🔵 Firebase token received:", token ? "✅ Success" : "❌ Failed");
          
          if (token) {
            console.log("🔵 Token value:", token.substring(0, 20) + "...");
            setDevToken(token);
            localStorage.setItem("devToken", token);
            return token;
          } else {
            console.warn("⚠️ Firebase returned null/empty token");
            console.warn("⚠️ This might be because:");
            console.warn("   - Firebase messaging is not initialized");
            console.warn("   - Service worker is not registered");
            console.warn("   - VAPID key is incorrect");
            console.warn("   - Browser doesn't support FCM");
          }
        } catch (error) {
          console.error("❌ Error getting Firebase device token:", error);
          console.error("❌ Error details:", error.message);
          console.error("❌ Error stack:", error.stack);
        }
      }
    } else {
      console.warn("⚠️ Window is undefined");
    }
    console.log("🔵 Returning empty token");
    return "";
  };
  
  // Get Firebase device token on component mount
  useEffect(() => {
    getDeviceToken();
  }, []);

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
        // Ensure we have the Firebase device token before login
        let tokenToUse = devToken || localStorage.getItem("devToken");
        if (!tokenToUse) {
          tokenToUse = await getDeviceToken();
        }
        
        const loginPayload = {
          email: userData?.email,
          password: userData?.password,
          signedFrom: "",
          dvToken: tokenToUse || "",
        };
        
        console.log("🔵 Login Request Payload:", loginPayload);
        console.log("🔵 Device Token:", tokenToUse ? "✅ Available" : "❌ Empty");
        
        const res = await userLogin(loginPayload).unwrap();

        console.log("🔵 Login Response:", res);

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
          // Store access token from login response
          if (res.data.accessToken) {
            localStorage.setItem("accessToken", res.data.accessToken);
          }

          // Dispatch custom event to notify Header component
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("userLogin"));
          }

          setStep("new-order");
          router.replace("/");

          addToast({
            title: "User Login",
            description: "Login successfully",
            color: "success",
          });
        } else if (
          (res?.status === "0" && res?.statusCode === 401) ||
          res?.message === "Please verify your email to continue" ||
          res?.error === "Please verify your email to continue" ||
          res?.message === "Pending email verification" ||
          res?.error === "Pending email verification" ||
          (res?.status === "2" || res?.statusCode === 2)
        ) {
          // OTP verification required - navigate to OTP screen
          localStorage.setItem("userId", res?.data?.userId);
          localStorage.setItem("otpId", res?.data?.otpId);
          localStorage.setItem("email", res?.data?.email || userData?.email);
          localStorage.setItem("type", "register");
          setUserData({ ...userData, verficationPending: true });
          setStep("otp");
          startCountdown();
          addToast({
            title: "OTP Verification Required",
            description: res?.error || res?.message || "Please verify your email with OTP",
            color: "warning",
          });
        } else {
          addToast({
            title: "Login Failed",
            description: res?.error,
            color: "danger",
          });
        }
      } catch (err) {
        console.log("🔴 Login Error:", err);
        console.log("🔴 Error Data:", err?.data);
        
        // Extract error data
        const errorData = err?.data || {};
        const errorMessage = errorData?.error || errorData?.message || "";
        const is401 = errorData?.statusCode === 401 || errorData?.status === "0";
        
        // Check if error is due to OTP verification required
        const isOtpRequired = 
          is401 && (
            errorMessage === "Please verify your email to continue" ||
            errorMessage === "Pending email verification" ||
            errorMessage?.toLowerCase().includes("verify your email") ||
            errorMessage?.toLowerCase().includes("email verification")
          );

        // Check if error is due to missing fields (name, phone, etc.)
        const isMissingFields = 
          is401 && (
            errorMessage?.toLowerCase().includes("first name") ||
            errorMessage?.toLowerCase().includes("phone number") ||
            errorMessage?.toLowerCase().includes("missing") ||
            errorMessage?.toLowerCase().includes("required")
          ) && !isOtpRequired;

        console.log("🔵 Is 401:", is401);
        console.log("🔵 Is OTP Required:", isOtpRequired);
        console.log("🔵 Is Missing Fields:", isMissingFields);
        console.log("🔵 Error Message:", errorMessage);

        if (isOtpRequired) {
          console.log("✅ Navigating to OTP screen...");
          // OTP verification required - navigate to OTP screen
          localStorage.setItem("userId", errorData?.data?.userId);
          localStorage.setItem("otpId", errorData?.data?.otpId);
          localStorage.setItem("email", errorData?.data?.email || userData?.email);
          localStorage.setItem("type", "register");
          setUserData({ ...userData, verficationPending: true });
          setStep("otp");
          startCountdown();
          addToast({
            title: "OTP Verification Required",
            description: errorMessage || "Please verify your email with OTP",
            color: "warning",
          });
        } else if (isMissingFields) {
          console.log("✅ Navigating to signup form for missing fields...");
          // Missing fields - navigate to signup form
          setRegister({
            firstName: "",
            lastName: "",
            password: userData?.password || "",
            confirmPassword: userData?.password || "",
            dvToken: devToken || "",
            phoneNum: "",
            countryCode: "PK",
            email: userData?.email || "",
            profileImage: null,
            signedFrom: "", // Regular signup, not social auth
          });
          setStep("sign-up");
          addToast({
            title: "Complete Your Profile",
            description: errorMessage || "Please provide your missing information to continue",
            color: "warning",
          });
        } else {
        addToast({
          title: "Login Failed",
            description: errorMessage || "Login failed. Please try again.",
          color: "danger",
        });
        }
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
      try {
      let res = await resetPassword({
        email: userData?.resetPassword,
      }).unwrap();
      if (res?.status === "1") {
        localStorage.setItem("userId", res?.data?.userId);
        localStorage.setItem("type", "forgot");
        localStorage.setItem("otpId", res?.data?.otpId);
        localStorage.setItem("email", userData?.resetPassword);
        addToast({
          title: "Reset Password",
          description: "OTP sent successfully",
          color: "success",
        });
        setStep("otp");
        startCountdown();
      } else {
        addToast({
          title: "Reset Password",
            description: res?.error || res?.message || "Something went wrong",
            color: "danger",
          });
        }
      } catch (err) {
        console.log("🔴 Reset Password Error:", err);
        console.log("🔴 Error Data:", err?.data);
        const errorData = err?.data || {};
        const errorMessage = errorData?.error || errorData?.message || "Something went wrong. Please try again.";
        
        addToast({
          title: "Reset Password Failed",
          description: errorMessage,
          color: "danger",
        });
      }
    }
  };

  const VerifyOtp = async (e) => {
    e.preventDefault();
    try {
    let res = await verifyOTP({
      OTP: otp,
      otpId: localStorage.getItem("otpId"),
    }).unwrap();

    if (res?.status === "1") {
      clearAll();
      addToast({
        title: "Verify OTP",
          description: "OTP verified successfully",
        color: "success",
      });
      setStep("password");
    } else {
      addToast({
        title: "Verify OTP",
          description: "OTP is incorrect",
          color: "danger",
        });
      }
    } catch (err) {
      console.log("🔴 Verify OTP Error:", err);
      console.log("🔴 Error Data:", err?.data);
      const errorData = err?.data || {};
      
      addToast({
        title: "Verify OTP Failed",
        description: "OTP is incorrect",
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
    try {
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
      localStorage.setItem("stripeCustomerId", res?.data?.stripeCustomerId);
      // Store access token from login response
      if (res?.data?.accessToken) {
        localStorage.setItem("accessToken", res?.data?.accessToken);
      }
        // Set userName from API response or register state
        const firstName = res?.data?.firstName || register?.firstName || "";
        const lastName = res?.data?.lastName || register?.lastName || "";
        if (firstName || lastName) {
          localStorage.setItem("userName", `${firstName} ${lastName}`.trim());
        }
        localStorage.setItem("phoneNum", res?.data?.phoneNum || register?.phoneNum || "");
      localStorage.removeItem("type");
      localStorage.removeItem("otpId");
        
        // Dispatch custom event to notify Header component
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userLogin"));
        }
        
      clearAll();
      addToast({
          title: "Verify OTP",
        description: res?.message,
        color: "success",
      });
      dispatch(setPage(true));
      router.push("/");
      setStep("sign-in");
    } else {
      addToast({
          title: "Verify OTP",
          description: res?.error || res?.message || "Invalid OTP. Please try again.",
          color: "danger",
        });
      }
    } catch (err) {
      console.log("🔴 Verify OTP Register Error:", err);
      console.log("🔴 Error Data:", err?.data);
      const errorData = err?.data || {};
      const errorMessage = errorData?.error || errorData?.message || "Entered Incorrect OTP. Please enter correct OTP to continue";
      
      addToast({
        title: "Verify OTP Failed",
        description: errorMessage,
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
      try {
        let res = await changePasswordReset({
          password: userData?.resetPassword,
          otpId: localStorage.getItem("otpId"),
          userId: parseInt(localStorage.getItem("userId"), 10),
        }).unwrap();

        if (res?.status === "1") {
          clearAll();
          addToast({
            title: "Change password",
            description: res?.message || "Password updated successfully",
            color: "success",
          });
          dispatch(setPage(true));
          router.replace("/");
        } else {
          addToast({
            title: "Change password",
            description: res?.error || res?.message || "Failed to update password",
            color: "danger",
          });
        }
      } catch (err) {
        console.log("🔴 Change Password Error:", err);
        console.log("🔴 Error Data:", err?.data);
        const errorData = err?.data || {};
        const errorMessage = errorData?.error || errorData?.message || "Failed to update password. Please try again.";
        
        addToast({
          title: "Change password",
          description: errorMessage,
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
    } else if (register?.signedFrom && (register?.signedFrom === "google" || register?.signedFrom === "facebook" || register?.signedFrom === "apple")) {
      // Social auth - call login API with all required fields
      try {
        // Ensure we have the Firebase device token
        let tokenToUse = devToken || localStorage.getItem("devToken");
        if (!tokenToUse) {
          tokenToUse = await getDeviceToken();
        }
        
        const loginRes = await userLogin({
          email: register?.email,
          password: "", // Empty password for social auth
          signedFrom: register?.signedFrom,
          dvToken: tokenToUse || "",
          firstName: register?.firstName || "",
          lastName: register?.lastName || "",
          phoneNum: register?.phoneNum || "",
        }).unwrap();

        if (loginRes?.status === "1") {
          // Login successful
          localStorage.removeItem("otpId");
          localStorage.removeItem("type");
          localStorage.setItem("loginStatus", "true");
          localStorage.setItem("stripeCustomerId", loginRes.data.stripeCustomerId);
          localStorage.setItem("userId", loginRes.data.userId);
          localStorage.setItem("email", loginRes.data.email);
          localStorage.setItem("phoneNum", loginRes?.data?.phoneNum || "");
          localStorage.setItem(
            "userName",
            loginRes.data.firstName + " " + loginRes.data.lastName
          );
          // Store access token from login response
          if (loginRes.data.accessToken) {
            localStorage.setItem("accessToken", loginRes.data.accessToken);
          }

          // Dispatch custom event to notify Header component
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("userLogin"));
          }

          addToast({
            title: "Registration & Login Successful",
            description: "Account created and logged in successfully",
            color: "success",
          });

          dispatch(setPage(true));
          router.replace("/");
        } else if (loginRes?.statusCode === 400 && loginRes?.data?.missingFields) {
          // Missing required fields - show error with missing fields
          const missingFieldsList = loginRes?.data?.missingFields?.join(", ") || "required information";
          addToast({
            title: "Missing Information",
            description: `Please provide ${missingFieldsList}`,
            color: "warning",
          });
        } else {
          addToast({
            title: "Registration Failed",
            description: loginRes?.error || loginRes?.message || "Failed to complete registration. Please try again.",
            color: "danger",
          });
        }
      } catch (loginError) {
        const errorData = loginError?.data || {};
        if (errorData?.statusCode === 400 && errorData?.data?.missingFields) {
          // Missing required fields - show error with missing fields
          const missingFieldsList = errorData?.data?.missingFields?.join(", ") || "required information";
          addToast({
            title: "Missing Information",
            description: `Please provide ${missingFieldsList}`,
            color: "warning",
          });
        } else {
          addToast({
            title: "Registration Failed",
            description: errorData?.error || errorData?.message || loginError?.error || "Failed to complete registration. Please try again.",
            color: "danger",
          });
        }
      }
    } else if (!register?.password || !register?.confirmPassword) {
      // Regular registration - password required
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
      // Regular registration - call register API
      try {
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
      } catch (error) {
        // Handle registration error - check if user already exists
        const errorData = error?.data || {};
        const isUserExists = errorData?.statusCode === 409 ||
          errorData?.status === "0" ||
          errorData?.error?.toLowerCase().includes("already exists") ||
          errorData?.message?.toLowerCase().includes("already exists");

        if (isUserExists) {
          // User already exists - try to login
          try {
            const loginRes = await userLogin({
              email: register?.email,
              password: register?.password,
              signedFrom: "",
              dvToken: devToken || "",
            }).unwrap();

            if (loginRes?.status === "1") {
              // Login successful
              localStorage.removeItem("otpId");
              localStorage.removeItem("type");
              localStorage.setItem("loginStatus", "true");
              localStorage.setItem("stripeCustomerId", loginRes.data.stripeCustomerId);
              localStorage.setItem("userId", loginRes.data.userId);
              localStorage.setItem("email", loginRes.data.email);
              localStorage.setItem("phoneNum", loginRes?.data?.phoneNum || "");
              localStorage.setItem(
                "userName",
                loginRes.data.firstName + " " + loginRes.data.lastName
              );
              // Store access token from login response
              if (loginRes.data.accessToken) {
                localStorage.setItem("accessToken", loginRes.data.accessToken);
              }

              addToast({
                title: "Login Successful",
                description: "User already exists. Logged in successfully",
                color: "success",
              });

              dispatch(setPage(true));
              router.replace("/");
            } else {
              addToast({
                title: "Registration Failed",
                description: errorData?.error || errorData?.message || "User already exists but login failed",
                color: "danger",
              });
            }
          } catch (loginError) {
            addToast({
              title: "Registration Failed",
              description: errorData?.error || errorData?.message || "User already exists but login failed",
              color: "danger",
            });
          }
        } else {
          addToast({
            title: "User Registration",
            description: errorData?.error || errorData?.message || "Registration failed. Please try again.",
            color: "danger",
          });
        }
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

  // Helper function to extract username from email
  const extractUsernameFromEmail = (email) =>
    (email?.match(/^[a-zA-Z0-9._%+-]+/) || [])[0] || "";

  // Helper function to separate first and last name
  function separateNames(fullName) {
    if (!fullName) return { firstName: "", lastName: "" };
    const namesArray = fullName.split(" ");
    const firstName = namesArray[0];
    const lastName = namesArray.slice(1).join(" ");
    return {
      firstName: firstName,
      lastName: lastName,
    };
  }

  // Helper function to extract first and last name from email username
  function extractNamesFromEmailUsername(email) {
    if (!email) return { firstName: "", lastName: "" };

    // Extract username part (before @)
    const username = email.split("@")[0];

    // Try different separators: dot, underscore, hyphen, or numbers
    let nameParts = [];

    // Try splitting by dot first (most common: john.doe@gmail.com)
    if (username.includes(".")) {
      nameParts = username.split(".");
    }
    // Try splitting by underscore (john_doe@gmail.com)
    else if (username.includes("_")) {
      nameParts = username.split("_");
    }
    // Try splitting by hyphen (john-doe@gmail.com)
    else if (username.includes("-")) {
      nameParts = username.split("-");
    }
    // Try splitting by numbers (john123doe@gmail.com)
    else if (/\d/.test(username)) {
      nameParts = username.split(/(\d+)/).filter(part => part && !/\d/.test(part));
    }
    // If no separator, use the whole username as first name
    else {
      nameParts = [username];
    }

    // Clean up name parts (remove numbers, capitalize first letter)
    nameParts = nameParts
      .map(part => part.replace(/\d+/g, "").trim())
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      firstName: firstName,
      lastName: lastName,
    };
  }

  // Account merge handler
  const handleAccountMerge = async (error, auth) => {
    if (error.code === "auth/account-exists-with-different-credential") {
      const pendingCred = OAuthProvider.credentialFromError(error);
      const email = error.customData.email;

      try {
        const existingMethods = await fetchSignInMethodsForEmail(auth, email);
        let existingProvider = "";

        if (existingMethods.includes("google.com")) {
          existingProvider = "Google";
        } else if (existingMethods.includes("facebook.com")) {
          existingProvider = "Facebook";
        } else if (existingMethods.includes("apple.com")) {
          existingProvider = "Apple";
        } else {
          existingProvider = existingMethods[0] || "Email";
        }

        setPendingCred(pendingCred);
        setEmail(email);
        setExistingProvider(existingProvider);
        setShowMergeModal(true);
      } catch (mergeError) {
        console.error("Account merge error:", mergeError);
        addToast({
          title: "Account Merge Error",
          description: "Unable to merge accounts. Please try again.",
          color: "danger",
        });
      }
    }
  };

  // Merge accounts function
  const mergeAccounts = async () => {
    if (!mergeOtp || mergeOtp.length !== 4) {
      addToast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit OTP",
        color: "danger",
      });
      return;
    }

    try {
      // Step 1: Verify OTP with backend
      const otpResponse = await fetch(BASE_URL + "customer/verifyOTPforPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          OTP: mergeOtp,
          otpId: localStorage.getItem("otpId"),
        }),
      });

      const otpData = await otpResponse.json();

      if (otpData?.status === "1") {
        // Step 2: Sign in with existing provider
        let existingProviderInstance;
        if (existingProvider === "Google") {
          existingProviderInstance = new GoogleAuthProvider();
        } else if (existingProvider === "Facebook") {
          existingProviderInstance = new FacebookAuthProvider();
        } else if (existingProvider === "Apple") {
          existingProviderInstance = new OAuthProvider("apple.com");
        }

        const existingResult = await signInWithPopup(auth, existingProviderInstance);
        const existingUser = existingResult.user;

        // Step 3: Link the new credential to existing account
        await linkWithCredential(existingUser, pendingCred);

        // Step 4: Save user data
        localStorage.setItem("loginStatus", "true");
        localStorage.setItem("userId", otpData.data.userId);
        localStorage.setItem("email", existingUser.email);
        localStorage.setItem("phoneNum", otpData.data.phoneNum || "");
        localStorage.setItem("userName", existingUser.displayName || "");

        addToast({
          title: "Accounts Merged",
          description: "Your accounts have been successfully merged",
          color: "success",
        });

        setShowMergeModal(false);
        setMergeOtp("");
        dispatch(setPage(true));
        router.replace("/");
      } else {
        addToast({
          title: "OTP Verification Failed",
          description: otpData?.error || "Incorrect OTP. Please try again.",
          color: "danger",
        });
      }
    } catch (mergeError) {
      console.error("Merge error:", mergeError);
      addToast({
        title: "Account Merge Error",
        description: "Failed to merge accounts. Please try again.",
        color: "danger",
      });
    }
  };

  // Resend OTP for account merge
  const resendMergeOTP = async () => {
    try {
      const response = await fetch(BASE_URL + "customer/resendOTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
        }),
      });

      const data = await response.json();
      if (data?.status === "1") {
        addToast({
          title: "OTP Sent",
          description: "OTP has been resent to your email",
          color: "success",
        });
        startCountdown();
      } else {
        addToast({
          title: "Failed to Resend OTP",
          description: data?.error || "Please try again",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to resend OTP",
        color: "danger",
      });
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleAuthLoader(true);
    try {
      // Step 1: Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Console log all data from Google
      console.log("🔵 ========== GOOGLE AUTHENTICATION DATA ==========");
      console.log("📦 Full Result Object:", result);
      console.log("👤 Full User Object:", user);
      console.log("📧 User Email:", user.email);
      console.log("👤 User Display Name:", user.displayName);
      console.log("🖼️ User Photo URL:", user.photoURL);
      console.log("🆔 User UID:", user.uid);
      console.log("📱 User Phone Number:", user.phoneNumber);
      console.log("✅ Email Verified:", user.emailVerified);
      console.log("🔐 Provider Data:", user.providerData);
      console.log("📋 Metadata:", {
        creationTime: user.metadata?.creationTime,
        lastSignInTime: user.metadata?.lastSignInTime,
      });
      console.log("🎫 Access Token:", result.credential?.accessToken);
      console.log("🎫 ID Token:", await user.getIdToken().catch(() => "Not available"));
      console.log("🔑 Provider ID:", user.providerId);
      console.log("📝 All User Properties:", Object.keys(user));

      // Log provider-specific data
      if (result.credential) {
        console.log("🎫 Credential Object:", result.credential);
      }

      // Log additional info from Google
      console.log("📊 Additional Info:", {
        isAnonymous: user.isAnonymous,
        tenantId: user.tenantId,
        refreshToken: user.refreshToken,
      });

      // Step 2: Extract available data from Google
      const googleEmail = user.email || "";

      // Try to get name from displayName first, then from email username
      let nameParts = separateNames(user.displayName);
      let googleFirstName = nameParts.firstName || "";
      let googleLastName = nameParts.lastName || "";

      // If displayName doesn't have name, try extracting from email username
      if (!googleFirstName && !googleLastName && googleEmail) {
        const emailNameParts = extractNamesFromEmailUsername(googleEmail);
        googleFirstName = emailNameParts.firstName;
        googleLastName = emailNameParts.lastName;

        console.log("📧 Extracted name from email username:", {
          email: googleEmail,
          firstName: googleFirstName,
          lastName: googleLastName,
        });
      }

      console.log("✂️ Final Extracted Data:", {
        email: googleEmail,
        firstName: googleFirstName,
        lastName: googleLastName,
        fullName: user.displayName,
        source: user.displayName ? "displayName" : "emailUsername",
      });
      console.log("🔵 ==============================================");

      // Check if email is missing (critical - can't proceed without email)
      if (!googleEmail) {
        addToast({
          title: "Email Required",
          description: "Google account email is required. Please try again or use email signup.",
          color: "danger",
        });
        setGoogleAuthLoader(false);
        return;
      }

      // Check if name is missing - check if user exists first, then open signup modal if needed
      if (!googleFirstName && !googleLastName) {
        // Ensure we have the Firebase device token
        let tokenToUse = devToken || localStorage.getItem("devToken");
        if (!tokenToUse) {
          tokenToUse = await getDeviceToken();
        }
        
        // Check if user already exists before showing signup form
        const checkUserResponse = await fetch(BASE_URL + "customer/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
            email: googleEmail,
          password: "",
          signedFrom: "google",
            dvToken: tokenToUse || "",
        }),
      });

        const checkUserData = await checkUserResponse.json();

        console.log("🔵 ========== CHECK USER EXISTS (Missing Name) ==========");
        console.log("📥 Check User Response:", checkUserData);
        console.log("🔵 ======================================================");

        if (checkUserData?.status === "1") {
          // User exists - login directly
          localStorage.removeItem("otpId");
          localStorage.removeItem("type");
          localStorage.setItem("loginStatus", "true");
          localStorage.setItem("stripeCustomerId", checkUserData.data.stripeCustomerId);
          localStorage.setItem("userId", checkUserData.data.userId);
          localStorage.setItem("email", checkUserData.data.email);
          localStorage.setItem("phoneNum", checkUserData?.data?.phoneNum || "");
          localStorage.setItem(
            "userName",
            checkUserData.data.firstName + " " + checkUserData.data.lastName
          );
          // Store access token from login response
          if (checkUserData.data.accessToken) {
            localStorage.setItem("accessToken", checkUserData.data.accessToken);
          }
          // Store profile image from Google if available
          if (user.photoURL) {
            localStorage.setItem("profileImage", user.photoURL);
          }

          // Dispatch custom event to notify Header and other components
          // Use a small delay to ensure localStorage is fully updated
          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.dispatchEvent(new Event("userLogin"));
            }, 100);
          }

          addToast({
            title: "Login Successful",
            description: "Logged in with Google successfully",
            color: "success",
          });

          dispatch(setPage(true));
          router.replace("/");
          setGoogleAuthLoader(false);
          return;
        } else {
          // User doesn't exist - show signup form
          setRegister({
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            dvToken: devToken || "",
            phoneNum: "",
            countryCode: "PK",
            email: googleEmail,
            profileImage: null,
            signedFrom: "google", // Mark as Google social auth
          });
          setStep("sign-up");

          addToast({
            title: "Complete Your Profile",
            description: "Please provide your name and phone number to complete registration",
            color: "warning",
          });
          setGoogleAuthLoader(false);
          return;
        }
      }

      // Step 3: Check if user exists by trying to login first with available data
      console.log("🔍 Checking if user exists by trying login...");

      // Ensure we have the Firebase device token
      console.log("🔵 Current devToken state:", devToken ? "✅ Has value" : "❌ Empty");
      let tokenToUse = devToken || localStorage.getItem("devToken");
      console.log("🔵 Token from state/localStorage:", tokenToUse ? "✅ Found" : "❌ Not found");
      
      if (!tokenToUse) {
        console.log("🔵 Fetching token from Firebase...");
        tokenToUse = await getDeviceToken();
        console.log("🔵 Token after getDeviceToken:", tokenToUse ? "✅ Success" : "❌ Still empty");
      }
      
      console.log("🔵 Final token to use:", tokenToUse ? tokenToUse.substring(0, 30) + "..." : "❌ EMPTY");

      const loginPayload = {
        email: googleEmail,
        password: "",
        signedFrom: "google",
        dvToken: tokenToUse || "",
        firstName: googleFirstName || "",
        lastName: googleLastName || "",
        phoneNum: "",
      };
      
      console.log("🔵 Login request payload:", loginPayload);
      console.log("🔵 Login request payload dvToken:", loginPayload.dvToken ? "✅ Sent" : "❌ EMPTY - NOT SENT");

      const loginResponse = await fetch(BASE_URL + "customer/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(loginPayload),
      });

      const loginData = await loginResponse.json();

      console.log("🔵 ========== BACKEND LOGIN RESPONSE ==========");
      console.log("📤 Login Request:", {
        email: googleEmail,
        signedFrom: "google",
        firstName: googleFirstName,
        lastName: googleLastName,
      });
      console.log("📥 Login Response:", loginData);
      console.log("🔵 ============================================");

      // Step 4: Handle login response
      if (loginData?.status === "1") {
        // User exists and has all required info - login successful
        console.log("✅ User exists, login successful");

        localStorage.removeItem("otpId");
        localStorage.removeItem("type");
        localStorage.setItem("loginStatus", "true");
        localStorage.setItem("stripeCustomerId", loginData.data.stripeCustomerId);
        localStorage.setItem("userId", loginData.data.userId);
        localStorage.setItem("email", loginData.data.email);
        localStorage.setItem("phoneNum", loginData?.data?.phoneNum || "");
        localStorage.setItem(
          "userName",
          loginData.data.firstName + " " + loginData.data.lastName
        );
        // Store access token from login response
        if (loginData.data.accessToken) {
          localStorage.setItem("accessToken", loginData.data.accessToken);
        }
        // Store profile image from Google if available
        if (user.photoURL) {
          localStorage.setItem("profileImage", user.photoURL);
        }

        // Dispatch custom event to notify Header and other components
        // Use a small delay to ensure localStorage is fully updated
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.dispatchEvent(new Event("userLogin"));
          }, 100);
        }

        addToast({
          title: "Login Successful",
          description: "Logged in with Google successfully",
          color: "success",
        });

        dispatch(setPage(true));
        router.replace("/");
      } else if (loginData?.statusCode === 400 && loginData?.data?.missingFields) {
        // Missing required fields - show signup form with pre-filled Google data
        console.log("⚠️ Missing required fields:", loginData?.data?.missingFields);
        console.log("🆕 Showing signup form to collect missing information...");

        setRegister({
          firstName: googleFirstName || "",
          lastName: googleLastName || "",
          password: "",
          confirmPassword: "",
          dvToken: devToken || "",
          phoneNum: "",
          countryCode: "PK",
          email: googleEmail,
          profileImage: null,
          signedFrom: "google", // Mark as Google social auth
        });
        setStep("sign-up");

        const missingFieldsList = loginData?.data?.missingFields?.join(", ") || "required information";
        addToast({
          title: "Complete Your Registration",
          description: `Please provide ${missingFieldsList} to complete registration`,
          color: "warning",
        });
      } else {
        // Other error - show signup form
        console.log("🆕 User doesn't exist or error occurred, showing signup form...");

        setRegister({
          firstName: googleFirstName || "",
          lastName: googleLastName || "",
          password: "",
          confirmPassword: "",
          dvToken: devToken || "",
          phoneNum: "",
          countryCode: "PK",
          email: googleEmail,
          profileImage: null,
          signedFrom: "google", // Mark as Google social auth
        });
        setStep("sign-up");

        addToast({
          title: "Complete Your Registration",
          description: loginData?.error || loginData?.message || "Please provide your information to complete registration",
          color: "warning",
        });
      }
    } catch (error) {
      // Handle account merge if email exists with different provider
      if (error.code === "auth/account-exists-with-different-credential") {
        await handleAccountMerge(error, auth);
      } else if (error.code === "auth/popup-closed-by-user") {
        addToast({
          title: "Sign In Cancelled",
          description: "You closed the sign-in popup",
          color: "warning",
        });
      } else {
        console.error("Google sign-in error:", error);
        addToast({
          title: "Google Sign-In Error",
          description: error.message || "Failed to sign in with Google. Please try again.",
          color: "danger",
        });
      }
    } finally {
      setGoogleAuthLoader(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookAuthLoader(true);
    try {
      // Step 1: Sign in with Facebook popup
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Console log all data from Facebook
      console.log("🔵 ========== FACEBOOK AUTHENTICATION DATA ==========");
      console.log("📦 Full Result Object:", result);
      console.log("👤 Full User Object:", user);
      console.log("📧 User Email:", user.email);
      console.log("👤 User Display Name:", user.displayName);
      console.log("🖼️ User Photo URL:", user.photoURL);
      console.log("🆔 User UID:", user.uid);
      console.log("📱 User Phone Number:", user.phoneNumber);
      console.log("✅ Email Verified:", user.emailVerified);
      console.log("🔐 Provider Data:", user.providerData);
      console.log("📋 Metadata:", {
        creationTime: user.metadata?.creationTime,
        lastSignInTime: user.metadata?.lastSignInTime,
      });
      console.log("🎫 Access Token:", result.credential?.accessToken);
      console.log("🎫 ID Token:", await user.getIdToken().catch(() => "Not available"));
      console.log("🔑 Provider ID:", user.providerId);
      console.log("📝 All User Properties:", Object.keys(user));

      // Log provider-specific data
      if (result.credential) {
        console.log("🎫 Credential Object:", result.credential);
      }

      // Log additional info from Facebook
      console.log("📊 Additional Info:", {
        isAnonymous: user.isAnonymous,
        tenantId: user.tenantId,
        refreshToken: user.refreshToken,
      });

      // Step 2: Extract available data from Facebook
      const facebookEmail = user.email || "";

      // Try to get name from displayName first, then from email username
      let nameParts = separateNames(user.displayName);
      let facebookFirstName = nameParts.firstName || "";
      let facebookLastName = nameParts.lastName || "";

      // If displayName doesn't have name, try extracting from email username
      if (!facebookFirstName && !facebookLastName && facebookEmail) {
        const emailNameParts = extractNamesFromEmailUsername(facebookEmail);
        facebookFirstName = emailNameParts.firstName;
        facebookLastName = emailNameParts.lastName;

        console.log("📧 Extracted name from email username:", {
          email: facebookEmail,
          firstName: facebookFirstName,
          lastName: facebookLastName,
        });
      }

      console.log("✂️ Final Extracted Data:", {
        email: facebookEmail,
        firstName: facebookFirstName,
        lastName: facebookLastName,
        fullName: user.displayName,
        source: user.displayName ? "displayName" : "emailUsername",
      });
      console.log("🔵 ==============================================");

      // Check if email is missing (critical - can't proceed without email)
      if (!facebookEmail) {
        addToast({
          title: "Email Required",
          description: "Facebook account email is required. Please try again or use email signup.",
          color: "danger",
        });
        setFacebookAuthLoader(false);
        return;
      }

      // Check if name is missing - check if user exists first, then open signup modal if needed
      if (!facebookFirstName && !facebookLastName) {
        // Ensure we have the Firebase device token
        let tokenToUse = devToken || localStorage.getItem("devToken");
        if (!tokenToUse) {
          tokenToUse = await getDeviceToken();
        }
        
        // Check if user already exists before showing signup form
        const checkUserResponse = await fetch(BASE_URL + "customer/loginUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify({
            email: facebookEmail,
            password: "",
            signedFrom: "facebook",
            dvToken: tokenToUse || "",
          }),
        });

        const checkUserData = await checkUserResponse.json();

        console.log("🔵 ========== CHECK USER EXISTS (Missing Name) ==========");
        console.log("📥 Check User Response:", checkUserData);
        console.log("🔵 ======================================================");

        if (checkUserData?.status === "1") {
          // User exists - login directly
          localStorage.removeItem("otpId");
          localStorage.removeItem("type");
          localStorage.setItem("loginStatus", "true");
          localStorage.setItem("stripeCustomerId", checkUserData.data.stripeCustomerId);
          localStorage.setItem("userId", checkUserData.data.userId);
          localStorage.setItem("email", checkUserData.data.email);
          localStorage.setItem("phoneNum", checkUserData?.data?.phoneNum || "");
          localStorage.setItem(
            "userName",
            checkUserData.data.firstName + " " + checkUserData.data.lastName
          );
          // Store access token from login response
          if (checkUserData.data.accessToken) {
            localStorage.setItem("accessToken", checkUserData.data.accessToken);
          }
          // Store profile image from Facebook if available
          if (user.photoURL) {
            localStorage.setItem("profileImage", user.photoURL);
          }

          // Dispatch custom event to notify Header component
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("userLogin"));
          }

          addToast({
            title: "Login Successful",
            description: "Logged in with Facebook successfully",
            color: "success",
          });

          dispatch(setPage(true));
          router.replace("/");
          setFacebookAuthLoader(false);
          return;
        } else {
          // User doesn't exist - show signup form
          setRegister({
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            dvToken: devToken || "",
            phoneNum: "",
            countryCode: "PK",
            email: facebookEmail,
            profileImage: null,
            signedFrom: "facebook", // Mark as Facebook social auth
          });
          setStep("sign-up");

          addToast({
            title: "Complete Your Profile",
            description: "Please provide your name and phone number to complete registration",
            color: "warning",
          });
          setFacebookAuthLoader(false);
          return;
        }
      }

      // Step 3: Check if user exists by trying to login first with available data
      console.log("🔍 Checking if user exists by trying login...");

      // Ensure we have the Firebase device token
      let tokenToUse = devToken || localStorage.getItem("devToken");
      if (!tokenToUse) {
        tokenToUse = await getDeviceToken();
      }

      const loginResponse = await fetch(BASE_URL + "customer/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          email: facebookEmail,
          password: "",
          signedFrom: "facebook",
          dvToken: tokenToUse || "",
          firstName: facebookFirstName || "",
          lastName: facebookLastName || "",
          phoneNum: "",
        }),
      });

      const loginData = await loginResponse.json();

      console.log("🔵 ========== BACKEND LOGIN RESPONSE ==========");
      console.log("📤 Login Request:", {
        email: facebookEmail,
        signedFrom: "facebook",
        firstName: facebookFirstName,
        lastName: facebookLastName,
      });
      console.log("📥 Login Response:", loginData);
      console.log("🔵 ============================================");

      // Step 4: Handle login response
      if (loginData?.status === "1") {
        // User exists and has all required info - login successful
        console.log("✅ User exists, login successful");

        localStorage.removeItem("otpId");
        localStorage.removeItem("type");
        localStorage.setItem("loginStatus", "true");
        localStorage.setItem("stripeCustomerId", loginData.data.stripeCustomerId);
        localStorage.setItem("userId", loginData.data.userId);
        localStorage.setItem("email", loginData.data.email);
        localStorage.setItem("phoneNum", loginData?.data?.phoneNum || "");
        localStorage.setItem(
          "userName",
          loginData.data.firstName + " " + loginData.data.lastName
        );
        // Store access token from login response
        if (loginData.data.accessToken) {
          localStorage.setItem("accessToken", loginData.data.accessToken);
        }
        // Store profile image from Facebook if available
        if (user.photoURL) {
          localStorage.setItem("profileImage", user.photoURL);
        }

        addToast({
          title: "Login Successful",
          description: "Logged in with Facebook successfully",
          color: "success",
        });

        dispatch(setPage(true));
        router.replace("/");
      } else if (loginData?.statusCode === 400 && loginData?.data?.missingFields) {
        // Missing required fields - show signup form with pre-filled Facebook data
        console.log("⚠️ Missing required fields:", loginData?.data?.missingFields);
        console.log("🆕 Showing signup form to collect missing information...");

        setRegister({
          firstName: facebookFirstName || "",
          lastName: facebookLastName || "",
          password: "",
          confirmPassword: "",
          dvToken: devToken || "",
          phoneNum: "",
          countryCode: "PK",
          email: facebookEmail,
          profileImage: null,
          signedFrom: "facebook", // Mark as Facebook social auth
        });
        setStep("sign-up");

        const missingFieldsList = loginData?.data?.missingFields?.join(", ") || "required information";
        addToast({
          title: "Complete Your Registration",
          description: `Please provide ${missingFieldsList} to complete registration`,
          color: "warning",
        });
      } else {
        // Other error - show signup form
        console.log("🆕 User doesn't exist or error occurred, showing signup form...");

        setRegister({
          firstName: facebookFirstName || "",
          lastName: facebookLastName || "",
          password: "",
          confirmPassword: "",
          dvToken: devToken || "",
          phoneNum: "",
          countryCode: "PK",
          email: facebookEmail,
          profileImage: null,
          signedFrom: "facebook", // Mark as Facebook social auth
        });
        setStep("sign-up");

        addToast({
          title: "Complete Your Registration",
          description: loginData?.error || loginData?.message || "Please provide your information to complete registration",
          color: "warning",
        });
      }
    } catch (error) {
      // Handle account merge if email exists with different provider
      if (error.code === "auth/account-exists-with-different-credential") {
        await handleAccountMerge(error, auth);
      } else if (error.code === "auth/popup-closed-by-user") {
        addToast({
          title: "Sign In Cancelled",
          description: "You closed the sign-in popup",
          color: "warning",
        });
      } else {
        console.error("Facebook sign-in error:", error);
        addToast({
          title: "Facebook Sign-In Error",
          description: error.message || "Failed to sign in with Facebook. Please try again.",
          color: "danger",
        });
      }
    } finally {
      setFacebookAuthLoader(false);
    }
  };

  const handleAppleLogin = async () => {
    setAppleAuthLoader(true);
    try {
      // Step 1: Sign in with Apple popup
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;

      // Console log all data from Apple
      console.log("🔵 ========== APPLE AUTHENTICATION DATA ==========");
      console.log("📦 Full Result Object:", result);
      console.log("👤 Full User Object:", user);
      console.log("📧 User Email:", user.email);
      console.log("👤 User Display Name:", user.displayName);
      console.log("🖼️ User Photo URL:", user.photoURL);
      console.log("🆔 User UID:", user.uid);
      console.log("📱 User Phone Number:", user.phoneNumber);
      console.log("✅ Email Verified:", user.emailVerified);
      console.log("🔐 Provider Data:", user.providerData);
      console.log("📋 Metadata:", {
        creationTime: user.metadata?.creationTime,
        lastSignInTime: user.metadata?.lastSignInTime,
      });
      console.log("🎫 Access Token:", result.credential?.accessToken);
      console.log("🎫 ID Token:", await user.getIdToken().catch(() => "Not available"));
      console.log("🔑 Provider ID:", user.providerId);
      console.log("📝 All User Properties:", Object.keys(user));

      // Log provider-specific data
      if (result.credential) {
        console.log("🎫 Credential Object:", result.credential);
      }

      // Log additional info from Apple
      console.log("📊 Additional Info:", {
        isAnonymous: user.isAnonymous,
        tenantId: user.tenantId,
        refreshToken: user.refreshToken,
      });

      // Step 2: Extract available data from Apple
      const appleEmail = user.email || "";

      // Try to get name from displayName first, then from email username
      let nameParts = separateNames(user.displayName);
      let appleFirstName = nameParts.firstName || "";
      let appleLastName = nameParts.lastName || "";

      // If displayName doesn't have name, try extracting from email username
      if (!appleFirstName && !appleLastName && appleEmail) {
        const emailNameParts = extractNamesFromEmailUsername(appleEmail);
        appleFirstName = emailNameParts.firstName;
        appleLastName = emailNameParts.lastName;

        console.log("📧 Extracted name from email username:", {
          email: appleEmail,
          firstName: appleFirstName,
          lastName: appleLastName,
        });
      }

      console.log("✂️ Final Extracted Data:", {
        email: appleEmail,
        firstName: appleFirstName,
        lastName: appleLastName,
        fullName: user.displayName,
        source: user.displayName ? "displayName" : "emailUsername",
      });
      console.log("🔵 ==============================================");

      // Check if email is missing (critical - can't proceed without email)
      if (!appleEmail) {
        addToast({
          title: "Email Required",
          description: "Apple account email is required. Please try again or use email signup.",
          color: "danger",
        });
        setAppleAuthLoader(false);
        return;
      }

      // Check if name is missing - check if user exists first, then open signup modal if needed
      if (!appleFirstName && !appleLastName) {
        // Ensure we have the Firebase device token
        let tokenToUse = devToken || localStorage.getItem("devToken");
        if (!tokenToUse) {
          tokenToUse = await getDeviceToken();
        }
        
        // Check if user already exists before showing signup form
        const checkUserResponse = await fetch(BASE_URL + "customer/loginUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify({
            email: appleEmail,
            password: "",
            signedFrom: "apple",
            dvToken: tokenToUse || "",
          }),
        });

        const checkUserData = await checkUserResponse.json();

        console.log("🔵 ========== CHECK USER EXISTS (Missing Name) ==========");
        console.log("📥 Check User Response:", checkUserData);
        console.log("🔵 ======================================================");

        if (checkUserData?.status === "1") {
          // User exists - login directly
          localStorage.removeItem("otpId");
          localStorage.removeItem("type");
          localStorage.setItem("loginStatus", "true");
          localStorage.setItem("stripeCustomerId", checkUserData.data.stripeCustomerId);
          localStorage.setItem("userId", checkUserData.data.userId);
          localStorage.setItem("email", checkUserData.data.email);
          localStorage.setItem("phoneNum", checkUserData?.data?.phoneNum || "");
          localStorage.setItem(
            "userName",
            checkUserData.data.firstName + " " + checkUserData.data.lastName
          );
          // Store profile image from Apple if available
          if (user.photoURL) {
            localStorage.setItem("profileImage", user.photoURL);
          }

          // Dispatch custom event to notify Header component
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("userLogin"));
          }

          addToast({
            title: "Login Successful",
            description: "Logged in with Apple successfully",
            color: "success",
          });

          dispatch(setPage(true));
          router.replace("/");
          setAppleAuthLoader(false);
          return;
        } else {
          // User doesn't exist - show signup form
          setRegister({
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            dvToken: devToken || "",
            phoneNum: "",
            countryCode: "PK",
            email: appleEmail,
            profileImage: null,
            signedFrom: "apple", // Mark as Apple social auth
          });
          setStep("sign-up");

          addToast({
            title: "Complete Your Profile",
            description: "Please provide your name and phone number to complete registration",
            color: "warning",
          });
          setAppleAuthLoader(false);
          return;
        }
      }

      // Step 3: Check if user exists by trying to login first with available data
      console.log("🔍 Checking if user exists by trying login...");

      // Ensure we have the Firebase device token
      let tokenToUse = devToken || localStorage.getItem("devToken");
      if (!tokenToUse) {
        tokenToUse = await getDeviceToken();
      }

      const loginResponse = await fetch(BASE_URL + "customer/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          email: appleEmail,
          password: "",
          signedFrom: "apple",
          dvToken: tokenToUse || "",
          firstName: appleFirstName || "",
          lastName: appleLastName || "",
          phoneNum: "",
        }),
      });

      const loginData = await loginResponse.json();

      console.log("🔵 ========== BACKEND LOGIN RESPONSE ==========");
      console.log("📤 Login Request:", {
        email: appleEmail,
        signedFrom: "apple",
        firstName: appleFirstName,
        lastName: appleLastName,
      });
      console.log("📥 Login Response:", loginData);
      console.log("🔵 ============================================");

      // Step 4: Handle login response
      if (loginData?.status === "1") {
        // User exists and has all required info - login successful
        console.log("✅ User exists, login successful");

        localStorage.removeItem("otpId");
        localStorage.removeItem("type");
        localStorage.setItem("loginStatus", "true");
        localStorage.setItem("stripeCustomerId", loginData.data.stripeCustomerId);
        localStorage.setItem("userId", loginData.data.userId);
        localStorage.setItem("email", loginData.data.email);
        localStorage.setItem("phoneNum", loginData?.data?.phoneNum || "");
        localStorage.setItem(
          "userName",
          loginData.data.firstName + " " + loginData.data.lastName
        );
        // Store access token from login response
        if (loginData.data.accessToken) {
          localStorage.setItem("accessToken", loginData.data.accessToken);
        }
        // Store profile image from Apple if available
        if (user.photoURL) {
          localStorage.setItem("profileImage", user.photoURL);
        }

        // Dispatch custom event to notify Header component
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userLogin"));
        }

        addToast({
          title: "Login Successful",
          description: "Logged in with Apple successfully",
          color: "success",
        });

        dispatch(setPage(true));
        router.replace("/");
      } else if (loginData?.statusCode === 400 && loginData?.data?.missingFields) {
        // Missing required fields - show signup form with pre-filled Apple data
        console.log("⚠️ Missing required fields:", loginData?.data?.missingFields);
        console.log("🆕 Showing signup form to collect missing information...");

        setRegister({
          firstName: appleFirstName || "",
          lastName: appleLastName || "",
          password: "",
          confirmPassword: "",
          dvToken: devToken || "",
          phoneNum: "",
          countryCode: "PK",
          email: appleEmail,
          profileImage: null,
          signedFrom: "apple", // Mark as Apple social auth
        });
        setStep("sign-up");

        const missingFieldsList = loginData?.data?.missingFields?.join(", ") || "required information";
        addToast({
          title: "Complete Your Registration",
          description: `Please provide ${missingFieldsList} to complete registration`,
          color: "warning",
        });
      } else {
        // Other error - show signup form
        console.log("🆕 User doesn't exist or error occurred, showing signup form...");

        setRegister({
          firstName: appleFirstName || "",
          lastName: appleLastName || "",
          password: "",
          confirmPassword: "",
          dvToken: devToken || "",
          phoneNum: "",
          countryCode: "PK",
          email: appleEmail,
          profileImage: null,
          signedFrom: "apple", // Mark as Apple social auth
        });
        setStep("sign-up");

        addToast({
          title: "Complete Your Registration",
          description: loginData?.error || loginData?.message || "Please provide your information to complete registration",
          color: "warning",
        });
      }
    } catch (error) {
      // Handle account merge if email exists with different provider
      if (error.code === "auth/account-exists-with-different-credential") {
        await handleAccountMerge(error, auth);
      } else if (error.code === "auth/popup-closed-by-user") {
        addToast({
          title: "Sign In Cancelled",
          description: "You closed the sign-in popup",
          color: "warning",
        });
      } else if (error.code === "auth/operation-not-allowed") {
        console.error("Apple sign-in error:", error);
        addToast({
          title: "Apple Sign-In Not Configured",
          description: "Apple Sign-In is enabled but not fully configured. Please check Firebase Console settings (Service ID, Team ID, Key ID, and Private Key). For development, ensure Apple is enabled in Firebase Console.",
          color: "danger",
        });
      } else {
        console.error("Apple sign-in error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        addToast({
          title: "Apple Sign-In Error",
          description: error.message || "Failed to sign in with Apple. Please try again.",
          color: "danger",
        });
      }
    } finally {
      setAppleAuthLoader(false);
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

          <div className="w-full h-screen lg:overflow-auto flex justify-center lg:items-center px-5 sm:px-8 sm:pad-y relative">
            {/* Back Button */}
            <button
              onClick={() => {
                if (step === "forgot" || step === "otp" || step === "sign-up") {
                  // If on forgot password, OTP, or sign-up, go back to login screen
                  setStep("sign-in");
                } else if (step === "sign-in") {
                  // If on login screen, go back to home
                  dispatch(setPage(true));
                  router.back();
                }
              }}
              className="absolute top-5 left-5 sm:bottom-[120px] sm:top-auto sm:left-8 lg:top-8 lg:left-8 lg:bottom-auto flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm z-10"
              aria-label="Go back"
            >
              <FaChevronLeft className="text-theme-blue text-lg" />
            </button>

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

                <div className="flex items-center gap-3 pt-5 pl-16 sm:hidden">
                  <h4 className="font-youth font-bold text-2xl text-theme-blue">
                    Welcome Back!
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
                    disabled={googleAuthLoader || isLoading}
                  />
                  <ButtonContinueWith
                    text="Continue with facebook"
                    size="18px"
                    src="/images/auth/facebook.png"
                    onClick={handleFacebookLogin}
                    disabled={facebookAuthLoader || isLoading}
                  />
                  <ButtonContinueWith
                    text="Continue with Apple"
                    size="18px"
                    src="/images/auth/email.png"
                    onClick={handleAppleLogin}
                    disabled={appleAuthLoader || isLoading}
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
                      isDisabled={isResetPasswordLoading}
                      isPending={isResetPasswordLoading}
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
                  {/* Hide password fields for social auth */}
                  {!register?.signedFrom || (register?.signedFrom !== "google" && register?.signedFrom !== "facebook" && register?.signedFrom !== "apple") ? (
                    <>
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
                    </>
                  ) : null}

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
                    {(() => {
                      // For signup, use the email from register state
                      // For password reset, use the email from userData or localStorage
                      const type = typeof window !== "undefined" ? localStorage.getItem("type") : "";
                      if (type === "register" || (!type && register?.email)) {
                        return register?.email || "";
                      } else if (type === "forgot") {
                        return userData?.resetPassword || localStorage.getItem("email") || "";
                      } else {
                        return localStorage.getItem("email") || register?.email || "";
                      }
                    })()}
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
                    {typeof window !== "undefined" && localStorage.getItem("type") === "forgot" 
                      ? "Enter your new password to reset your account password."
                      : "Create an account and start enjoying cleaner clothes with zero effort!"}
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
                      text={typeof window !== "undefined" && localStorage.getItem("type") === "forgot" ? "Update Password" : "Register"}
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

        {/* Account Merge Modal */}
        {showMergeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
              <h3 className="font-youth text-2xl font-bold text-theme-blue">
                Account Merge Required
              </h3>
              <p className="font-sf text-base text-theme-gray-2">
                This email is already registered with {existingProvider}. Please
                enter the OTP sent to your email to merge accounts.
              </p>
              <div className="space-y-3">
                <InputOtp
                  fullWidth
                  size="lg"
                  length={4}
                  value={mergeOtp}
                  variant={mergeOtp.length > 0 ? "bordered" : "flat"}
                  onValueChange={setMergeOtp}
                />
                <div className="flex gap-3">
                  <ButtonYouth70018
                    text="Verify & Merge"
                    onClick={mergeAccounts}
                    isDisabled={!mergeOtp || mergeOtp.length !== 4}
                  />
                  <button
                    onClick={() => {
                      setShowMergeModal(false);
                      setMergeOtp("");
                    }}
                    className="px-4 py-2 font-sf text-base text-theme-gray-2 border border-theme-gray-2 rounded-lg hover:bg-theme-gray-2/10"
                  >
                    Cancel
                  </button>
                </div>
                {isActive ? (
                  <p className="font-sf text-sm text-center text-theme-gray-2">
                    Resend code in {secondsLeft} seconds
                  </p>
                ) : (
                  <p
                    onClick={resendMergeOTP}
                    className="font-sf text-sm text-center text-theme-brightBlue cursor-pointer"
                  >
                    Resend OTP
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </HomeClientWrapper>
    </>
  );
}
