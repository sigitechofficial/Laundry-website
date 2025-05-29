import React from "react";

const CustomRadioBtn = ({ id, name, checked, onChange, disabled }) => {
  return (
    <label className={`ios-radio ${disabled ? "disabled" : ""}`} htmlFor={id}>
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="radio-wrapper">
        <div className="radio-bg"></div>
        <svg fill="none" viewBox="0 0 24 24" className="radio-icon">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            stroke="currentColor"
            d="M4 12L10 18L20 6"
            className="check-path"
          ></path>
        </svg>
      </div>
      <style>{`
        .ios-radio {
          --radio-size: 24px;
          --radio-color: rgb(64, 135, 93);
          --radio-bg: #d1fae5;
          --radio-border: #e4e4e5;
          position: relative;
          display: inline-block;
          cursor: pointer;
          user-select: none;
        }

        .ios-radio input {
          display: none;
        }

        .radio-wrapper {
          position: relative;
          width: var(--radio-size);
          height: var(--radio-size);
          border-radius: 50%;
          transition: transform 0.2s ease;
        }

        .radio-bg {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid var(--radio-border);
          background: white;
          transition: all 0.2s ease;
        }

        .radio-icon {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 65%;
          height: 65%;
          color: white;
          transform: scale(0);
          transition: all 0.2s ease;
        }

        .check-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          transition: stroke-dashoffset 0.3s ease 0.1s;
          transform: translateY(1px); 

        }

        .ios-radio input:checked + .radio-wrapper .radio-bg {
          background: var(--radio-color);
          border-color: var(--radio-color);
        }

        .ios-radio input:checked + .radio-wrapper .radio-icon {
          transform: scale(1);
        }

        .ios-radio input:checked + .radio-wrapper .check-path {
          stroke-dashoffset: 0;
        }

        .ios-radio input:disabled + .radio-wrapper .radio-bg {
          background: #e5e7eb;
          cursor: not-allowed;
        }

        .ios-radio input:disabled + .radio-wrapper {
          pointer-events: none;
        }

        .ios-radio:hover .radio-wrapper {
          transform: scale(1.05);
        }

        .ios-radio:active .radio-wrapper {
          transform: scale(0.95);
        }

        .ios-radio input:focus + .radio-wrapper .radio-bg {
          box-shadow: 0 0 0 4px var(--radio-bg);
        }

        @keyframes bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .ios-radio input:checked + .radio-wrapper {
          animation: bounce 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </label>
  );
};

export default CustomRadioBtn;
