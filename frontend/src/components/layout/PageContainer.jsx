const PageContainer = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-slate-300 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-700">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
