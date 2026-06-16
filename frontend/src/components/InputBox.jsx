const InputBox = ({ label, type = "text", placeholder, value, onChange }) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        className="input-box" 
        required 
      />
    </div>
  );
};

export default InputBox;
