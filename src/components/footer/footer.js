export const footer = () => {
    const footer = document.createElement('footer');
    footer.className = 'footer';

    // Estructura grid igual al header
    // Logo a la izquierda
    const logoDiv = document.createElement('div');
    logoDiv.className = 'footer-logo';
    const logo = document.createElement('img');
    logo.src = '/public/kemel.png';
    logo.alt = 'Logo Kemel';
    logoDiv.appendChild(logo);

    // Info a la derecha
    const infoDiv = document.createElement('div');
    infoDiv.className = 'footer-info';
    infoDiv.innerHTML = `&copy; ${new Date().getFullYear()} Kemel. Todos los derechos reservados.<br>
    Contacto: <a href="mailto:asesor@kemel.online">asesor@kemel.online</a> | Tel: <a href="tel:3000000001">3000000001</a>`;

    // Grid principal
    footer.appendChild(logoDiv);
    footer.appendChild(infoDiv);
    return footer;
};
