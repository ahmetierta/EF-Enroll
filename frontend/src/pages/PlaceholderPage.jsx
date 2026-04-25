const PlaceholderPage = ({ title }) => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="rounded-3xl border border-slate-300 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-slate-600">
          This page is already available in the navigation and will be
          connected once we build its frontend CRUD module.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
