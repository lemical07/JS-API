// --- Selectores del DOM ---
const input = document.getElementById('input-search');
const btnSearch = document.getElementById('btn-searchh');
const imageContainer = document.getElementById('img-container');
const detailsContainer = document.getElementById('details-container');
const loader = document.getElementById('loader');

// variable principal donde guardaremos los lanzamientos
let launchList = [];

// función para iniciar la aplicación
async function init() {
    // mostramos el loader mientras carga
    loader.style.display = 'flex';

    try {
        const response = await fetch('https://api.spacexdata.com/v4/launches');

        if (!response.ok) throw new Error(`Error de red: ${response.status}`);

        const data = await response.json();

        // guardamos todos los lanzamientos disponibles de la API
        launchList = data;

        // esperamos 3 segundos para que el loader sea visible  ← NUEVA
        await new Promise(resolve => setTimeout(resolve, 3000));

        // ocultamos el loader al terminar
        loader.style.display = 'none';
        // mensaje de bienvenida mientras el usuario decide qué buscar
    detailsContainer.innerHTML = `
        <div class="welcome-msg">
            <h2 class="welcome-title">SpaceX Launch Explorer</h2>
            <p class="welcome-sub">Click a mission on the carousel<br>or search by name.</p>
        </div>`;

    imageContainer.innerHTML = `
        <div class="welcome-img">🚀</div>`;

    } catch (error) {
        // esperamos 3 segundos incluso si hay error
        await new Promise(resolve => setTimeout(resolve, 3000));

        // manejo de errores visible para el usuario
        loader.style.display = 'none';
        detailsContainer.innerHTML = `
            <p style="color:red">Error loading data: ${error.message}. Please try again later.</p>
        `;
        console.error('Error en init():', error);
        return; // detenemos si falla la API
    }

    // generamos las cards del carrusel dinámicamente desde la API
    renderCards();

    // activamos los clics en las cards
    clickConfig();
}