function Header({children}) {

    return (
      <header>
        <figure className="logo">
          <h1 className="brand-name">SANTANA HOT DOG</h1>
        </figure>
        <div id="header-content">{children}</div>
      </header>
    );
  }
  
export default Header;
  