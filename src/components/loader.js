function Loader({ loading }) {
  return (
    <div className={`global-loader ${loading ? "loading" : ""}`}>
      <div className="spinner" />
    </div>
  );
}

export default Loader;
