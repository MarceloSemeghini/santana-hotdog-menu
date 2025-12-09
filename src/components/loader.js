function Loader({ loading }) {
  return (loading &&
    <div className={`global-loader ${loading ? "loading" : ""}`}>
      <div className="spinner" />
    </div>
  );
}

export default Loader;
