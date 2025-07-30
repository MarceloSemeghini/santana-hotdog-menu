import { useState, useEffect } from 'react';

function Floater({children, className = "", condition = true}) {
  const [visible, setVisible] = useState(true); 
  const [lastScrollY, setLastScrollY] = useState(0); 

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`floater ${condition && visible ? '' : 'hidden'} ${className}`}>
      {children}
    </div>
  );
}

export default Floater;