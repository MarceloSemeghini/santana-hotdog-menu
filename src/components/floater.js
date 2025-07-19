import { useState, useEffect } from 'react';

function Floater() {
  const [isVisible, setIsVisible] = useState(true); 
  const [lastScrollY, setLastScrollY] = useState(0); 

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`floater ${isVisible ? 'visible' : 'hidden'}`}>
      <ul className='floater-info'>
        <li className='floater-link'>
          <a className="whatsapp" href='/'>
            <figure />
          </a>
        </li>
        <li className='summary-wrapper' id='floating-summary'/>
      </ul>
    </div>
  );
}

export default Floater;
