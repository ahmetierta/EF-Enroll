const PageContainer = ({ children, title }) => {
  return (
    <div className="bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {title && (
          <div className="mb-5 border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold uppercase text-blue-700">
              Workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
