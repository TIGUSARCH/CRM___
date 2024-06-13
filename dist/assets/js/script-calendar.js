// tu_script.js

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'], // Utiliza el plugin DayGrid para mostrar el calendario
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'dayGridMonth', // Vista inicial del calendario
        editable: true, // Permite la edición de eventos en el calendario
        selectable: true, // Permite la selección de fechas en el calendario
        select: function (info) {
            // Abre el formulario para agregar un nuevo evento al seleccionar una fecha
            document.getElementById('pc-e-venue').value = ''; // Limpiar el campo de Venue
            document.getElementById('pc-e-title').value = ''; // Limpiar el campo de Title
            document.getElementById('pc-e-description').value = ''; // Limpiar el campo de Description
            document.getElementById('pc-e-type').value = 'empty'; // Restaurar el valor por defecto del campo Type
            document.getElementById('pc-e-sdate').value = info.startStr; // Asignar la fecha de inicio al campo oculto
            document.getElementById('pc-e-edate').value = info.endStr; // Asignar la fecha de fin al campo oculto
            var offcanvas = new bootstrap.Offcanvas(document.getElementById('calendar-add_edit_event'));
            offcanvas.show(); // Mostrar el formulario para agregar evento
        }
    });

    calendar.render();

    // Manejar el envío del formulario para agregar eventos
    document.getElementById('pc_event_add').addEventListener('click', function () {
        var title = document.getElementById('pc-e-title').value;
        var venue = document.getElementById('pc-e-venue').value;
        var description = document.getElementById('pc-e-description').value;
        var type = document.getElementById('pc-e-type').value;
        var startDate = document.getElementById('pc-e-sdate').value;
        var endDate = document.getElementById('pc-e-edate').value;

        // Validación básica
        if (!title || !startDate || !endDate) {
            alert('Por favor ingresa el título, la fecha de inicio y la fecha de fin del evento.');
            return;
        }

        // Agregar el nuevo evento al calendario
        calendar.addEvent({
            title: title,
            start: startDate,
            end: endDate,
            allDay: true, // Indica que el evento dura todo el día
            description: description,
            venue: venue,
            className: type
        });

        // Cerrar el formulario y limpiar los campos
        var offcanvas = new bootstrap.Offcanvas(document.getElementById('calendar-add_edit_event'));
        offcanvas.hide();
        document.getElementById('event-form').reset();
    });
});
