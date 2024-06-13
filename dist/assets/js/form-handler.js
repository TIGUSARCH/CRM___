document.getElementById('pc_event_add').addEventListener('click', function() {
    // Recopilar datos del formulario
    const eventData = {
        title: document.getElementById('pc-e-title').value,
        venue: document.getElementById('pc-e-venue').value,
        description: document.getElementById('pc-e-description').value,
        type: document.getElementById('pc-e-type').value
    };

    // Verificar que el título no esté vacío
    if (!eventData.title) {
        console.error('El título del evento no puede estar vacío');
        return;
    }

    // Convertir datos a JSON
    const jsonData = JSON.stringify(eventData);

    // Enviar datos al servidor
    fetch('/add-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    })
    .then(response => {
        if (response.ok) {
            console.log('Evento agregado correctamente');
            // Aquí puedes hacer algo después de que el evento se haya agregado exitosamente
        } else {
            console.error('Error al agregar evento');
        }
    })
    .catch(error => {
        console.error('Error de red:', error);
    });
});
