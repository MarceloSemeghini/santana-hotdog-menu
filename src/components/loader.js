function Loader({ loading }) {
  if (!loading) return null;

  return (
    <div className="global-loader">
      <div className="spinner" />
    </div>
  );
}

export default Loader;
