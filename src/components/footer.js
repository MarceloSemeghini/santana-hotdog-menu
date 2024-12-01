import { useState, useEffect } from 'react';

function Footer() {
  const [isVisible, setIsVisible] = useState(true); // Estado de visibilidade do footer
  const [lastScrollY, setLastScrollY] = useState(0); // Última posição de scroll

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determina se o footer deve aparecer ou desaparecer
      if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scroll para baixo, esconder
      } else {
        setIsVisible(true); // Scroll para cima, mostrar
      }

      setLastScrollY(currentScrollY); // Atualiza a última posição
    };

    // Adiciona o evento de scroll
    window.addEventListener('scroll', handleScroll);

    // Limpa o evento ao desmontar o componente
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <footer className={`footer ${isVisible ? 'visible' : 'hidden'}`}>
      <ul>
        <li>
          <a className="whatsapp">
            <figure />
          </a>
        </li>
        <li>
          <button className='to-checkout'>Continuar</button>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
