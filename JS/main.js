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
// función para generar las catrtas del carrusel desde launchList
function renderCards() {
    //toma el div para el carrusel del html
    const carousel = document.getElementById('launch-carousel');
    // tomamos solo 10 para el carrusel visual
    const carouselItems = launchList.slice(0, 10);

    // fix: usamos setProperty para que la variable CSS --n funcione correctamente
    carousel.style.setProperty('--n', carouselItems.length);
    //Limpiamos el carrusel para no duplicar alguna carta
    carousel.innerHTML = '';

    carouselItems.forEach((launch, index) => {
        const img = document.createElement('img');
        //acceso a la imagen que nos da el api ||si los links o patch son son undefined, entonces usa esta imagen de placeholder como respaldo
        img.src = launch.links?.patch?.small || 'https://via.placeholder.com/200x200?text=No+Patch';
        img.alt = launch.name;
        //creamos o asignamos una clase para que el carrusel haga su función
        img.className = 'card';
        // fix: usamos setProperty para que --i funcione en el carrusel 3D
        img.style.setProperty('--i', index);
        img.onerror = () => { img.src = 'https://via.placeholder.com/200x200?text=No+Patch'; };//si la imagen falla lo remplaza con el place holder
        carousel.appendChild(img);
    });
}
// función para mostrar el detalle de un lanzamiento
function displayLaunch(launch) {
    // imagen del parche de la misión con fallback
    const imgSrc = launch.links?.patch?.small || 'https://via.placeholder.com/300x300?text=No+Image';

    imageContainer.innerHTML = `
        <img src="${imgSrc}" 
             alt="${launch.name}" 
             style="width:100%; border-radius:15px; box-shadow: 0 0 15px cyan;"
             onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
    `;

    // formateamos la fecha de forma legible
    const fecha = new Date(launch.date_utc).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // estado del lanzamiento
    const estado = launch.upcoming
        ? 'Upcoming'
        : launch.success
            ? '✅ Success'
            : '❌ Failed';

    // otros links relacionados con el lanzamiento (video, wikipedia)
    const youtubeLink = launch.links?.webcast
        ? `<a href="${launch.links.webcast}" target="_blank" style="color:#00e5ff; text-decoration: none" >Watch a video</a>`
        : '';
    const wikiLink = launch.links?.wikipedia
        ? `<a href="${launch.links.wikipedia}" target="_blank" style="color:#00e5ff; text-decoration: none" >Wikipedia</a>`
        : '';

    detailsContainer.innerHTML = `
        <h2 style="color:#00e5ff;">🚀 ${launch.name}</h2>
        <p><strong>Flight Number:</strong> #${launch.flight_number}</p>
        <p><strong>Date:</strong> ${fecha}</p>
        <p><strong>Status:</strong> ${estado}</p>
        <p><strong>Details:</strong> ${launch.details || 'No details available.'}</p>
        <p>${youtubeLink} &nbsp; ${wikiLink}</p>
    `;
}
// función de clics en las cartas del carrusel
function clickConfig() {
    const cards = document.querySelectorAll('.card');//Tomamos todas las cartas del carrusel
    cards.forEach(card => {//recoremos cada una de las caras
        card.onclick = () => {//definimos que pasa al dar click en las cartas
            const foundedLaunch = launchList.find(l => l.name === card.alt);//buscamos en la lista de lanzamiento cuyo nombre coincida con el alt de las cartas
            if (foundedLaunch)
                displayLaunch(foundedLaunch);
            else
                detailsContainer.innerHTML = `<p>Launch not found. Please try again.</p>`;
        };
    });
}
// lógica del btn de búsqueda
btnSearch.addEventListener('click', () => {
    const query = input.value.trim().toLowerCase();
    const results = launchList.find(l => l.name.toLowerCase().includes(query));//buscamos si el nombre del lanzamiento vcontiene lo q se busca con .includes(query)
    if (results) {
        displayLaunch(results);
    } else {
        detailsContainer.innerHTML = `<p style="color:gold">Launch not found.</p>`;
    }
});

// lógica de búsqueda al presionar Enter
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        btnSearch.click();
    }
});
// iniciamos la aplicación
init();