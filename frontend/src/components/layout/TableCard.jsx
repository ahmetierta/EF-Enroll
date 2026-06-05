const TableCard = ({ children, title }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-2">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
      </div>
      <div className="p-5">
      {children}
      </div>
    </div>
  );
};

export default TableCard;
