const TextInput = ({ className = "", type = "text", ...props }) => {
  return (
    <input
      type={type}
      className={`w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};

export default TextInput;
