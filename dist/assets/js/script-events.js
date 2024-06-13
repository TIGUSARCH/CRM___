// Hacer una solicitud GET a la API para obtener la lista de eventos
fetch('http://localhost:3001/eventos')
    .then(response => response.json())
    .then(data => {
        // Procesar la respuesta y mostrar los eventos en la página
        const eventosList = document.getElementById('eventos-list');
        data.forEach(evento => {
            const listItem = document.createElement('li');
            listItem.textContent = `${evento.titulo} - ${evento.fecha}`;
            eventosList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error al obtener la lista de eventos:', error));
