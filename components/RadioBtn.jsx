import React from "react";

const RadioBtn = ({ id, checked, onChange, size = 5 }) => {
  const styleVars = {
    "--size": `${size}px`,
  };
  return (
    <>
      <style>
        {`
       .checkbox-wrapper * {
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkbox-wrapper label {
  --size: 24px;
  position: relative;
  display: block;
  width: var(--size);
  height: var(--size);
  margin: 0 auto;
  background-color: #0000001a;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s ease transform, 0.2s ease background-color,
      0.2s ease box-shadow;
  overflow: hidden;
  z-index: 1;
}

.checkbox-wrapper label:before {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  width: calc(var(--size) * .8);
  height: calc(var(--size) * .8);
  margin: 0 auto;
  background-color: #fff;
  transform: translateY(-50%);
  border-radius: 50%;
  transition: 0.2s ease width, 0.2s ease height;
}


.checkbox-wrapper .tick_mark {
  position: absolute;
  top: 0px;
  right: 0;
  left: calc(var(--size) * -.05);
  width: calc(var(--size) * .6);
  height: calc(var(--size) * .6);
  margin: 0 auto;
  margin-left: calc(var(--size) * .14);
  transform: rotateZ(-40deg);
}

.checkbox-wrapper .tick_mark:before,
  .checkbox-wrapper .tick_mark:after {
  content: "";
  position: absolute;
  background-color: #fff;
  border-radius: 2px;
  opacity: 0;
  transition: 0.2s ease transform, 0.2s ease opacity;
}

.checkbox-wrapper .tick_mark:before {
  left: 0;
  bottom: 0;
  width: calc(var(--size) * .1);
  height: calc(var(--size) * .3);
  transform: translateY(calc(var(--size) * -.68));
}

.checkbox-wrapper .tick_mark:after {
  left: 0;
  bottom: 0;
  width: 100%;
  height: calc(var(--size) * .1);
  transform: translateX(calc(var(--size) * .78));
}

.checkbox-wrapper input[type="checkbox"]:checked + label {
  background-color: green;
}

.checkbox-wrapper input[type="checkbox"]:checked + label:before {
  width: 0;
  height: 0;
}

.checkbox-wrapper input[type="checkbox"]:checked + label .tick_mark:before,
  .checkbox-wrapper input[type="checkbox"]:checked + label .tick_mark:after {
  transform: translate(0);
  opacity: 1;
}
      `}
      </style>
      <div className="checkbox-wrapper" style={styleVars}>
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <label htmlFor={id}>
          <div className="tick_mark"></div>
        </label>
      </div>
    </>
  );
};

export default RadioBtn;
