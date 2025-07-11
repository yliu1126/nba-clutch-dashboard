import React from "react";
import "./Dropdown.scss" 


const Dropdown = ({ id, label, options, value, onChange }) => {
  return (
    <div className="dropdown">
      <label className="label" htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;