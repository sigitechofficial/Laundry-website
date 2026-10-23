"use client";
import React, { useState, useEffect } from "react";
import AuthLayout, { AuthAlt, AuthDivider, AuthFine, AuthHeading, AuthLink, authStyles } from "../../../../components/auth/AuthLayout";
import InputHeroUi from "../../../../components/InputHeroUi";
import {
  ButtonContinueWith,
  ButtonYouth70018,
} from "../../../../components/Buttons";
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
import "react-phone-input-2/lib/style.css";
import PhoneInputComp from "../../../../components/PhoneInputComp";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { BASE_URL } from "../../../../utilities/URL";
import { CountDown } from "../../../../utilities/CountDown";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { MiniLoader } from "../../../../components/Loader";
import { requestDeviceToken } from "../../../../utilities/requestFCMToken";

export default function SignInPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userLogin, { isLoading }] = useUserLoginMutation();
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
          router.replace("/place-order");

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
      router.push("/place-order");
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
          router.replace("/place-order");
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
          router.replace("/place-order");
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
          // Keep user on signup and show backend message only.
          addToast({
            title: "User Registration",
            description:
              errorData?.error ||
              errorData?.message ||
              "User with this email already exists",
            color: "warning",
          });
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
        router.replace("/place-order");
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
          router.replace("/place-order");
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
        router.replace("/place-order");
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
          router.replace("/place-order");
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
        router.replace("/place-order");
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
          router.replace("/place-order");
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
        router.replace("/place-order");
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

  // Back: sub-steps return to login; login returns to the previous page.
  const handleBack = () => {
    if (step === "forgot" || step === "otp" || step === "sign-up") {
      setStep("sign-in");
    } else if (step === "sign-in") {
      dispatch(setPage(true));
      router.back();
    }
  };

  const otpEmail = (() => {
    // Signup uses the register email; password reset uses the reset email.
    if (typeof window === "undefined") return "";
    const type = localStorage.getItem("type");
    if (type === "register" || (!type && register?.email)) return register?.email || "";
    if (type === "forgot") return userData?.resetPassword || localStorage.getItem("email") || "";
    return localStorage.getItem("email") || register?.email || "";
  })();

  const isForgotFlow = typeof window !== "undefined" && localStorage.getItem("type") === "forgot";

  const legalFine = (
    <AuthFine>
      By creating an account, you agree to our <Link href="/terms">Terms</Link> and{" "}
      <Link href="/privacy-policy">Privacy Policy</Link>.
    </AuthFine>
  );

  return (
    <>
      <AuthLayout onBack={step === "new-order" || step === "password" ? undefined : handleBack}>
        {step === "sign-in" ? (
          <>
            <AuthHeading title="Log in to your account" sub="Welcome back. Enter your details to continue." />
            <form
              className={authStyles.form}
              onSubmit={(e) => {
                e.preventDefault();
                userData.verficationPending ? handleResendOtp(e) : handleLogin(e);
              }}
              noValidate
            >
              <InputHeroUi
                type="email"
                label="Email address"
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                value={userData?.email}
                validate={(value) => {
                  const validateEmail = (v) => v.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
                  if (!validateEmail(value)) return "Please enter a valid email address";
                  return value === "admin" ? "Nice try!" : null;
                }}
              />
              <InputHeroUi
                type="password"
                label="Password"
                value={userData?.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                validate={(value) => {
                  if (value.length < 6) return "Password must be at least 6 characters long";
                  return value === "admin" ? "Nice try!" : null;
                }}
              />
              <div className={authStyles.row}>
                <AuthLink onClick={() => setStep("forgot")}>Forgot password?</AuthLink>
              </div>
              <ButtonYouth70018
                text={userData.verficationPending ? "Send code" : "Log in"}
                onClick={(e) => {
                  userData.verficationPending ? handleResendOtp(e) : handleLogin(e);
                }}
                isDisabled={isLoading}
                isPending={isLoading}
              />
            </form>

            <AuthDivider />

            <div className={authStyles.social}>
              <ButtonContinueWith
                text="Continue with Google"
                shortText="Google"
                className="min-[1081px]:h-12 min-[1081px]:px-3"
                src="/images/auth/google.png"
                onClick={handleGoogleLogin}
                disabled={googleAuthLoader || isLoading}
              />
              <ButtonContinueWith
                text="Continue with Facebook"
                shortText="Facebook"
                className="min-[1081px]:h-12 min-[1081px]:px-3"
                src="/images/auth/facebook.png"
                onClick={handleFacebookLogin}
                disabled={facebookAuthLoader || isLoading}
              />
              <ButtonContinueWith
                text="Continue with Apple"
                shortText="Apple"
                className="min-[1081px]:h-12 min-[1081px]:px-3"
                src="/jdc/icons/apple.svg"
                onClick={handleAppleLogin}
                disabled={appleAuthLoader || isLoading}
              />
            </div>

            <AuthAlt text="New to Just Dry Cleans?" action="Create an account" onAction={() => setStep("sign-up")} />
          </>
        ) : step === "forgot" ? (
          <>
            <AuthHeading
              title="Forgot your password?"
              sub="Enter your email and we'll send you a code to create a new password."
            />
            <form
              className={authStyles.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleResetPassword(e);
              }}
              noValidate
            >
              <InputHeroUi
                type="email"
                label="Email address"
                value={userData?.resetPassword}
                onChange={(e) => setUserData({ ...userData, resetPassword: e.target.value })}
              />
              <ButtonYouth70018
                text="Send reset code"
                onClick={handleResetPassword}
                isDisabled={isResetPasswordLoading}
                isPending={isResetPasswordLoading}
              />
            </form>
            <AuthAlt text="Remembered it?" action="Back to log in" onAction={() => setStep("sign-in")} />
          </>
        ) : step === "sign-up" ? (
          <>
            <AuthHeading
              title="Create your account"
              sub="Start enjoying cleaner clothes with zero effort."
            />
            <div className={authStyles.form}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                <InputHeroUi
                  type="text"
                  label="First name"
                  name="firstName"
                  value={register?.firstName}
                  onChange={handleRegisterChange}
                  validate={(value) => {
                    if (value.length < 3) return "First name must be at least 3 characters long";
                    return value === "admin" ? "Nice try!" : null;
                  }}
                />
                <InputHeroUi
                  type="text"
                  label="Last name"
                  name="lastName"
                  value={register?.lastName}
                  onChange={handleRegisterChange}
                  validate={(value) => {
                    if (value.length < 3) return "Last name must be at least 3 characters long";
                    return value === "admin" ? "Nice try!" : null;
                  }}
                />
              </div>
              <InputHeroUi
                type="email"
                label="Email address"
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
              {/* Password fields are not needed for social sign-up */}
              {!register?.signedFrom ||
              (register?.signedFrom !== "google" &&
                register?.signedFrom !== "facebook" &&
                register?.signedFrom !== "apple") ? (
                <>
                  <InputHeroUi
                    type="password"
                    label="Password"
                    name="password"
                    value={register?.password}
                    onChange={handleRegisterChange}
                    validate={(value) => {
                      if (value.length < 6) return "Password must be at least 6 characters long";
                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />
                  <InputHeroUi
                    type="password"
                    label="Confirm password"
                    name="confirmPassword"
                    value={register?.confirmPassword}
                    onChange={handleRegisterChange}
                    validate={(value) => {
                      if (value.length < 6) return "Password must be at least 6 characters long";
                      if (register?.confirmPassword !== register?.password)
                        return "Password and confirm password is not same";
                      return value === "admin" ? "Nice try!" : null;
                    }}
                  />
                </>
              ) : null}
              <ButtonYouth70018 text="Create account" onClick={handleAddUser} />
              {legalFine}
            </div>
            <AuthAlt text="Already have an account?" action="Log in" onAction={() => setStep("sign-in")} />
          </>
        ) : step === "otp" ? (
          <>
            <AuthHeading
              title="Verify your email"
              sub={
                <>
                  Enter the 4-digit code we sent to <strong>{otpEmail}</strong>
                </>
              }
            />
            <div className={authStyles.otpArt}>
              <img src="/images/auth/group.png" alt="" />
            </div>
            <div className="flex justify-center w-full py-3">
              <InputOtp
                classNames={{
                  wrapper: "flex justify-center",
                  segment:
                    "h-14 w-14 rounded-[14px] border-[1.5px] border-jdc-line bg-white font-display text-xl text-jdc-navy data-[active=true]:border-jdc-blue data-[active=true]:shadow-[0_0_0_4px_rgba(2,120,254,0.14)]",
                }}
                fullWidth
                size="lg"
                length={4}
                value={otp}
                variant="bordered"
                onValueChange={setOtp}
                aria-label="Verification code"
                errorMessage={<div className="text-center">{otp?.length < 4 ? "Enter all 4 digits" : " "}</div>}
              />
            </div>
            <div className={authStyles.form}>
              <ButtonYouth70018
                text="Verify"
                onClick={(e) =>
                  localStorage.getItem("type") === "register" ? handleVerifyOtpRegister(e) : VerifyOtp(e)
                }
              />
              <p className={authStyles.resend} aria-live="polite">
                {isActive ? (
                  <>Resend code in {secondsLeft}s</>
                ) : (
                  <>
                    Didn&apos;t get it?{" "}
                    <button type="button" onClick={handleResendOtp}>
                      Resend code
                    </button>
                  </>
                )}
              </p>
            </div>
          </>
        ) : step === "password" ? (
          <>
            <AuthHeading
              title={isForgotFlow ? "Set a new password" : "Create your password"}
              sub={
                isForgotFlow
                  ? "Enter your new password to reset your account password."
                  : "Choose a password to finish creating your account."
              }
            />
            <form
              className={authStyles.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleChangepasswordReset(e);
              }}
              noValidate
            >
              <InputHeroUi
                type="password"
                label="New password"
                name="password"
                onChange={(e) => setUserData({ ...userData, resetPassword: e.target.value })}
                validate={(value) => {
                  if (value.length < 6) return "Password must be at least 6 characters long";
                  return value === "admin" ? "Nice try!" : null;
                }}
              />
              <InputHeroUi
                type="password"
                label="Confirm password"
                name="confirmPassword"
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                validate={(value) => {
                  if (value.length < 6) return "Password must be at least 6 characters long";
                  return value === "admin" ? "Nice try!" : null;
                }}
              />
              <ButtonYouth70018
                text={isForgotFlow ? "Update password" : "Create account"}
                onClick={handleChangepasswordReset}
              />
              {isForgotFlow ? null : legalFine}
            </form>
            <AuthAlt text="Already have an account?" action="Log in" onAction={() => setStep("sign-in")} />
          </>
        ) : step === "new-order" ? (
          <div className={authStyles.loading}>
            <MiniLoader />
          </div>
        ) : null}
      </AuthLayout>

      {/* Account merge modal */}
      {showMergeModal && (
        <div className={authStyles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="merge-title">
          <div className={authStyles.modal}>
            <h2 id="merge-title">Link your accounts</h2>
            <p>
              This email is already registered with {existingProvider}. Enter the code we sent to your email to
              link the two sign-in methods.
            </p>
            <InputOtp
              classNames={{
                wrapper: "flex justify-center",
                segment:
                  "h-14 w-14 rounded-[14px] border-[1.5px] border-jdc-line bg-white font-display text-xl text-jdc-navy data-[active=true]:border-jdc-blue",
              }}
              fullWidth
              size="lg"
              length={4}
              value={mergeOtp}
              variant="bordered"
              onValueChange={setMergeOtp}
              aria-label="Verification code"
            />
            <div className={authStyles.modalActions}>
              <ButtonYouth70018
                text="Verify & link"
                onClick={mergeAccounts}
                isDisabled={!mergeOtp || mergeOtp.length !== 4}
              />
              <ButtonYouth70018
                text="Cancel"
                variant="outline"
                onClick={() => {
                  setShowMergeModal(false);
                  setMergeOtp("");
                }}
              />
            </div>
            <p className={authStyles.resend} aria-live="polite">
              {isActive ? (
                <>Resend code in {secondsLeft}s</>
              ) : (
                <button type="button" onClick={resendMergeOTP}>
                  Resend code
                </button>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
