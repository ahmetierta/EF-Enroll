const TableCard = ({ children, title }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white p-6 shadow-sm lg:col-span-2">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
};

export default TableCard;
