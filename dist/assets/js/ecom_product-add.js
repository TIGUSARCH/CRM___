


  // Función para mostrar u ocultar los campos adicionales según el tipo seleccionado
  function showHideAdditionalFields() {
    // Ocultar todos los campos adicionales
    document.getElementById('eventoCampos').style.display = 'none';
    document.getElementById('citaCampos').style.display = 'none';
    document.getElementById('reunionCampos').style.display = 'none';
    document.getElementById('consultaCampos').style.display = 'none';
    document.getElementById('verificacionCampos').style.display = 'none'; // Ocultar campos de verificación

    // Obtener el valor seleccionado del tipo de evento
    const selectedType = document.getElementById('type').value;

    // Mostrar los campos adicionales relevantes según el tipo seleccionado
    if (selectedType === 'evento') {
      document.getElementById('eventoCampos').style.display = 'block';
    } else if (selectedType === 'cita') {
      document.getElementById('citaCampos').style.display = 'block';
      document.getElementById('verificacionCampos').style.display = 'block'; // Mostrar campos de verificación
    } else if (selectedType === 'reunion') {
      document.getElementById('reunionCampos').style.display = 'block';
    } else if (selectedType === 'consulta') {
      document.getElementById('consultaCampos').style.display = 'block';
    }
  }

  // Escuchar el evento de cambio en el elemento 'type' del formulario
  document.getElementById('type').addEventListener('change', function() {
    // Llamar a la función para mostrar u ocultar los campos adicionales
    showHideAdditionalFields();
  });

  // Cambiar la acción del formulario según el tipo de cita seleccionado
  document.getElementById('addEventForm').addEventListener('submit', function(event) {
    const selectedType = document.getElementById('type').value;
    let actionUrl;

    // Determinar la URL de acción según el tipo de cita seleccionado
    if (selectedType === 'evento') {
      actionUrl = '/events';
    } else if (selectedType === 'cita') {
      actionUrl = '/crearCita';
    } else if (selectedType === 'reunion') {
      actionUrl = '/crearReunion';
    } else if (selectedType === 'consulta') {
      actionUrl = '/crearConsulta';
    }

    // Asignar la URL de acción al formulario
    this.action = actionUrl;

    // Verificar la URL de acción asignada
    console.log('URL de acción:', actionUrl);
  });
  
  // Escuchar el evento de cambio en el elemento 'type' del formulario
  document.getElementById('type').addEventListener('change', function() {
    // Llamar a la función para mostrar u ocultar los campos adicionales
    showHideAdditionalFields();
  });

  // Cambiar la acción del formulario y enviar datos según el tipo de evento seleccionado
  document.getElementById('addEventForm').addEventListener('submit', function(event) {
    const selectedType = document.getElementById('type').value;
    let actionUrl;
    let formData = {};

    // Determinar la URL de acción según el tipo de evento seleccionado

    /* 
    Para este tipo de eveto mandaemos la informacion que se tiene en el modelo de datos:
    eventName
    venue
    */
    if (selectedType === 'evento') {
      actionUrl = '/events';
      formData = {
        eventName: document.getElementById('eventName').value,
        venue: document.getElementById('venue').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value,
        type: selectedType
      };
    } else if (selectedType === 'cita') {
      actionUrl = '/crearCita';
      formData = {
        // Agregar aquí los campos específicos para citas si los hay
        type: selectedType
      };
    } else if (selectedType === 'reunion') {
      actionUrl = '/crearReunion';
      formData = {
        // Agregar aquí los campos específicos para reuniones si los hay
        type: selectedType
      };
    } else if (selectedType === 'consulta') {
      actionUrl = '/crearConsulta';
      formData = {
        // Agregar aquí los campos específicos para consultas si los hay
        type: selectedType
      };
    }

    // Verificar la URL de acción asignada
    console.log('URL de acción:', actionUrl);

    // Evitar que el formulario se envíe de forma predeterminada
    event.preventDefault();

    // Realizar la solicitud POST utilizando Fetch
    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al crear el evento');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta del servidor:', data);
      // Aquí puedes hacer alguna acción adicional, como redirigir a otra página
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

/* Funciona bien para el modelo que tenemos actualmente en el servidor */
/* 
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('addEventForm');

        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const eventName = document.getElementById('eventName').value;
            const venue = document.getElementById('venue').value;
            const description = document.getElementById('description').value;
            const status = document.getElementById('status').value;
            const type = document.getElementById('type').value;
            const fileInput = document.querySelector('input[type="file"]');
            const file = fileInput.files[0]; // Obtener el primer archivo seleccionado

            // Crear un objeto FormData para enviar el formulario con el archivo adjunto
            const formData = new FormData();
            formData.append('eventName', eventName);
            formData.append('venue', venue);
            formData.append('description', description);
            formData.append('status', status);
            formData.append('type', type);
            // Agregar el archivo adjunto si está presente
            if (file) {
                formData.append('file', file);
            }

            try {
                // Realizar la solicitud POST utilizando Fetch
                const response = await fetch('/events', {
                    method: 'POST',
                    body: formData // Usar el objeto FormData en lugar de JSON.stringify
                });

                if (!response.ok) {
                    throw new Error('Error al crear el evento');
                }

                const data = await response.json();
                console.log('Respuesta del servidor:', data);

                // Si todo sale bien, puedes hacer alguna acción adicional aquí, como redirigir a otra página
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
 */