import React from "react";

const CustomCheckbox = ({
  id,
  name,
  checked,
  onChange,
  disabled,
  color = "rgb(64, 135, 93)",
}) => {
  return (
    <label
      className={`ios-checkbox green ${disabled ? "disabled" : ""}`}
      htmlFor={id}
      style={{
        "--checkbox-color": color,
        "--checkbox-bg": "#d1fae5",
      }}
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="checkbox-wrapper">
        <div className="checkbox-bg"></div>
        <svg fill="none" viewBox="0 0 24 24" className="checkbox-icon">
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
        .ios-checkbox {
          --checkbox-size: 22px;
          --checkbox-color: color;
          --checkbox-bg: #d1fae5;
          --checkbox-border: #e4e4e5;
          position: relative;
          display: inline-block;
          cursor: pointer;
          user-select: none;
        }

        .ios-checkbox input {
          display: none;
        }

        .checkbox-wrapper {
          position: relative;
          width: var(--checkbox-size);
          height: var(--checkbox-size);
          border-radius: 4px;
          transition: transform 0.2s ease;
        }

        .checkbox-bg {
          position: absolute;
          inset: 0;
          border-radius: 4px;
          border: 2px solid var(--checkbox-border);
          background: white;
          transition: all 0.2s ease;
        }

        .checkbox-icon {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 80%;
          height: 80%;
          color: white;
          transform: scale(0);
          transition: all 0.2s ease;
        }

        .check-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          transition: stroke-dashoffset 0.3s ease 0.1s;
        }

        .ios-checkbox input:checked + .checkbox-wrapper .checkbox-bg {
          background: var(--checkbox-color);
          border-color: var(--checkbox-color);
        }

        .ios-checkbox input:checked + .checkbox-wrapper .checkbox-icon {
          transform: scale(1);
        }

        .ios-checkbox input:checked + .checkbox-wrapper .check-path {
          stroke-dashoffset: 0;
        }

        .ios-checkbox input:disabled + .checkbox-wrapper .checkbox-bg {
          background: #e5e7eb;
          cursor: not-allowed;
        }

        .ios-checkbox input:disabled + .checkbox-wrapper {
          pointer-events: none;
        }

        .ios-checkbox:hover .checkbox-wrapper {
          transform: scale(1.05);
        }

        .ios-checkbox:active .checkbox-wrapper {
          transform: scale(0.95);
        }

        .ios-checkbox input:focus + .checkbox-wrapper .checkbox-bg {
          box-shadow: 0 0 0 4px var(--checkbox-bg);
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

        .ios-checkbox input:checked + .checkbox-wrapper {
          animation: bounce 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </label>
  );
};

export default CustomCheckbox;
