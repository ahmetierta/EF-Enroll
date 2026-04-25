const FormCard = ({ children, title }) => {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
};

export default FormCard;
