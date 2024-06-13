(function () {
  const calendaroffcanvas = new bootstrap.Offcanvas('#calendar-add_edit_event');
  const calendarmodal = new bootstrap.Modal('#calendar-modal');
  var calendevent = '';

  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  var calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    themeSystem: 'bootstrap',
    initialDate: new Date(y, m, 16),
    slotDuration: '00:10:00',
    navLinks: true,
    height: 'auto',
    droppable: true,
    selectable: true,
    selectMirror: true,
    editable: true,
    dayMaxEvents: true,
    handleWindowResize: true,
    select: function (info) {
      var sdt = new Date(info.start);
      var edt = new Date(info.end);
      document.getElementById('pc-e-sdate').value = sdt.toISOString(); // Guardamos la fecha de inicio en un campo oculto
      document.getElementById('pc-e-edate').value = edt.toISOString(); // Guardamos la fecha de fin en un campo oculto
      calendaroffcanvas.show(); // Mostramos el formulario emergente para agregar un nuevo evento
      calendar.unselect();
    },
    eventClick: function (info) {
      calendevent = info.event;
      var clickedevent = info.event;
      var e_title = clickedevent.title === undefined ? '' : clickedevent.title;
      var e_desc = clickedevent.extendedProps.description === undefined ? '' : clickedevent.extendedProps.description;
      var e_date_start = clickedevent.start === null ? '' : dateformat(clickedevent.start);
      var e_date_end = clickedevent.end === null ? '' : " <i class='text-sm'>to</i> " + dateformat(clickedevent.end);
      e_date_end = clickedevent.end === null ? '' : e_date_end;
      var e_venue = clickedevent.extendedProps.description === undefined ? '' : clickedevent.extendedProps.venue;

      document.querySelector('.calendar-modal-title').innerHTML = e_title;
      document.querySelector('.pc-event-title').innerHTML = e_title;
      document.querySelector('.pc-event-description').innerHTML = e_desc;
      document.querySelector('.pc-event-date').innerHTML = e_date_start + e_date_end;
      document.querySelector('.pc-event-venue').innerHTML = e_venue;

      calendarmodal.show();
    },
    events: function (fetchInfo, successCallback, failureCallback) {
      // Obtener eventos de la API
      fetch('http://localhost:3001/events')
          .then(response => response.json())
          .then(data => {
              // Procesar la respuesta y pasar los eventos a FullCalendar
              var eventos = data.map(evento => ({
                  title: evento.title,
                  start: new Date(evento.createdAt),
                  end: new Date(evento.updatedAt),
                  description: evento.description,
                  venue: evento.venue,
                  className: evento.type
              }));
              successCallback(eventos);
          })
          .catch(error => {
              console.error('Error al obtener la lista de eventos:', error);
              failureCallback(error);
          });
  },
  
  });

  /* Create Read */

  // Manejador de evento para el botón de agregar evento
  document.getElementById('pc_event_add').addEventListener('click', function () {
    var title = document.getElementById('pc-e-title').value;
    var description = document.getElementById('pc-e-description').value;
    var startDate = document.getElementById('pc-e-sdate').value;
    var endDate = document.getElementById('pc-e-edate').value;
    var venue = document.getElementById('pc-e-venue').value;

    // Validación básica
    if (!title || !startDate || !endDate) {
      alert('Por favor ingresa el título, la fecha de inicio y la fecha de fin del evento.');
      return;
    }

    // Crear objeto de evento
    var evento = {
      titulo: title,
    descripcion: description,
    fecha: fecha
    };

    // Enviar el evento al servidor
    fetch('http://localhost:3001/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(evento)
    })
    .then(response => response.json())
    .then(data => {
      // Si la creación del evento fue exitosa, agregarlo al calendario
      calendar.addEvent({
        title: data.titulo,
        start: data.fecha,
        end: data.fechaFin,
        allDay: true,
        description: data.descripcion,
        venue: data.venue,
        className: data.className
      });
      
      // Limpiar el formulario y cerrar el formulario emergente
      document.getElementById('pc-form-event').reset();
      calendaroffcanvas.hide();
    })
    .catch(error => {
      console.error('Error al crear el evento:', error);
      alert('Error al crear el evento. Por favor intenta nuevamente.');
    });
  });

  calendar.render();
})();



calendar.render();
document.addEventListener('DOMContentLoaded', function () {
  var calbtn = document.querySelectorAll('.fc-toolbar-chunk');
  for (var t = 0; t < calbtn.length; t++) {
    var c = calbtn[t];
    c.children[0].classList.remove('btn-group');
    c.children[0].classList.add('d-inline-flex');
  }
});

var pc_event_remove = document.querySelector('#pc_event_remove');
if (pc_event_remove) {
  pc_event_remove.addEventListener('click', function () {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-light-success',
        cancelButton: 'btn btn-light-danger'
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'you want to delete this event?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      })
      .then((result) => {
        if (result.isConfirmed) {
          calendevent.remove();
          calendarmodal.hide();
          swalWithBootstrapButtons.fire('Deleted!', 'Your Event has been deleted.', 'success');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire('Cancelled', 'Your Event data is safe.', 'error');
        }
      });
  });
}

var pc_event_add = document.querySelector('#pc_event_add');
if (pc_event_add) {
  pc_event_add.addEventListener('click', function () {
    var day = true;
    var end = null;
    var e_date_start = document.getElementById('pc-e-sdate').value === null ? '' : document.getElementById('pc-e-sdate').value;
    var e_date_end = document.getElementById('pc-e-edate').value === null ? '' : document.getElementById('pc-e-edate').value;
    if (!e_date_end == '') {
      end = new Date(e_date_end);
    }
    calendar.addEvent({
      title: document.getElementById('pc-e-title').value,
      start: new Date(e_date_start),
      end: end,
      allDay: day,
      description: document.getElementById('pc-e-description').value,
      venue: document.getElementById('pc-e-venue').value,
      className: document.getElementById('pc-e-type').value
    });
    if (pc_event_add.getAttribute('data-pc-action') == 'add') {
      Swal.fire({
        customClass: {
          confirmButton: 'btn btn-light-primary'
        },
        buttonsStyling: false,
        icon: 'success',
        title: 'Success',
        text: 'Event added successfully'
      });
    } else {
      calendevent.remove();
      document.getElementById('pc-e-btn-text').innerHTML = '<i class="align-text-bottom me-1 ti ti-calendar-plus"></i> Add';
      document.querySelector('#pc_event_add').setAttribute('data-pc-action', 'add');
      Swal.fire({
        customClass: {
          confirmButton: 'btn btn-light-primary'
        },
        buttonsStyling: false,
        icon: 'success',
        title: 'Success',
        text: 'Event Updated successfully'
      });
    }
    calendaroffcanvas.hide();
  });
}

var pc_event_edit = document.querySelector('#pc_event_edit');
if (pc_event_edit) {
  pc_event_edit.addEventListener('click', function () {
    var e_title = calendevent.title === undefined ? '' : calendevent.title;
    var e_desc = calendevent.extendedProps.description === undefined ? '' : calendevent.extendedProps.description;
    var e_date_start = calendevent.start === null ? '' : dateformat(calendevent.start);
    var e_date_end = calendevent.end === null ? '' : " <i class='text-sm'>to</i> " + dateformat(calendevent.end);
    e_date_end = calendevent.end === null ? '' : e_date_end;
    var e_venue = calendevent.extendedProps.description === undefined ? '' : calendevent.extendedProps.venue;
    var e_type = calendevent.classNames[0] === undefined ? '' : calendevent.classNames[0];

    document.getElementById('pc-e-title').value = e_title;
    document.getElementById('pc-e-venue').value = e_venue;
    document.getElementById('pc-e-description').value = e_desc;
    document.getElementById('pc-e-type').value = e_type;
    var sdt = new Date(e_date_start);
    var edt = new Date(e_date_end);
    document.getElementById('pc-e-sdate').value = sdt.getFullYear() + '-' + getRound(sdt.getMonth() + 1) + '-' + getRound(sdt.getDate());
    document.getElementById('pc-e-edate').value = edt.getFullYear() + '-' + getRound(edt.getMonth() + 1) + '-' + getRound(edt.getDate());
    document.getElementById('pc-e-btn-text').innerHTML = '<i class="align-text-bottom me-1 ti ti-calendar-stats"></i> Update';
    document.querySelector('#pc_event_add').setAttribute('data-pc-action', 'edit');
    calendarmodal.hide();
    calendaroffcanvas.show();
  });
}
//  get round value
function getRound(vale) {
  var tmp = '';
  if (vale < 10) {
    tmp = '0' + vale;
  } else {
    tmp = vale;
  }
  return tmp;
}

//  get time
/* function getTime(temp) {
  temp = new Date(temp);
  if (temp.getHours() != null) {
    var hour = temp.getHours();
    var minute = temp.getMinutes() ? temp.getMinutes() : 00;
    return hour + ':' + minute;
  }
} */

//  get date
function dateformat(dt) {
  var mn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var d = new Date(dt),
    month = '' + mn[d.getMonth()],
    day = '' + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [day + ' ' + month, year].join(',');
}

//  get full date
function timeformat(time) {
  var temp = time.split(':');
  var hours = temp[0];
  var minutes = temp[1];
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + newformat;
}
/* })(); */ /* POR ALGUNA RAZÓN ESTA LÍNEA NOS ESTA PROVOCANDO QUE NO SE MUESTRE EL CALENDAR */
