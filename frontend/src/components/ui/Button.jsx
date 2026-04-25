const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
};

const Button = ({
  children,
  className = "",
  fullWidth = false,
  type = "button",
  variant = "primary",
  ...props
}) => {
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`rounded-lg px-4 py-3 font-semibold transition ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
