function Header({children}) {
    return (
      <header id="header">
        <figure className="logo" onClick={() => window.location.href = "/"}>
          <h1 className="brand-name">SANTANA HOT DOG</h1>
        </figure>
        <div id="header-content">{children}</div>
      </header>
    );
  }
  
export default Header;
  