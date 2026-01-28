import { useState, useEffect } from 'react';

function Floater({children, className = "", condition = true}) {
  const [visible, setVisible] = useState(true); 
  const [open, setOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    if (visible && !hasMounted) {
      setHasMounted(true)
    }
    if (visible !== open) {
      setOpen(visible)
    }
  }, [visible])

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
    <div className={`floater ${hasMounted ? condition && visible ? 'show' : 'hidden' : ""} ${className}`}>
      {children}
    </div>
  );
}

export default Floater;