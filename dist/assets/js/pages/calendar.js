(function () {
  const calendaroffcanvas = new bootstrap.Offcanvas('#calendar-add_edit_event');
  const calendarmodal = new bootstrap.Modal('#calendar-modal');
  
  // Obtener la fecha actual
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
    locale: 'es',
    themeSystem: 'bootstrap',
    initialDate: new Date(y, m, d),
    slotDuration: '00:10:00',
    navLinks: true,
    height: 'auto',
    droppable: true,
    selectable: true,
    selectMirror: true,
    editable: true,
    dayMaxEvents: true,
    handleWindowResize: true,
    businessHours: [ // specify an array instead
      {
        daysOfWeek: [ 1, 2, 3, 4, 5 ], // Monday, Tuesday, Wednesday
        startTime: '10:00', // 8am
        endTime: '18:00' // 6pm
      },
      {
        daysOfWeek: [ 6 ], // Thursday, Friday
        startTime: '10:30', // 10am
        endTime: '13:00' // 4pm
      }
    ],
  
    select: function (info) {
      var sdt = new Date(info.start);
      var edt = new Date(info.end);
      var horaSelccionadaInicio = (info.startStr);
      var horaSelccionadaFin = (info.endStr);
      document.getElementById('pc-e-sdate').value = sdt.getFullYear() + '-' + getRound(sdt.getMonth() + 1) + '-' + getRound(sdt.getDate());
      document.getElementById('pc-e-edate').value = edt.getFullYear() + '-' + getRound(edt.getMonth() + 1) + '-' + getRound(edt.getDate());
      calendaroffcanvas.show();
      alert('selected ' + horaSelccionadaInicio + ' to ' + horaSelccionadaFin);
      calendar.unselect();
    },
  
    eventClick: function (info) {
      calendevent = info.event;
      var clickedevent = info.event;
      var e_cli = clickedevent.extendedProps.cliente || '';//nombre cliente
      var e_user = clickedevent.extendedProps.usuario || '';//nombre cliente
      var e_desc = clickedevent.extendedProps.description || '';//descripcion
      var e_link = clickedevent.extendedProps.enlace || ' Sin Enlaces';//enlace
      var e_est = clickedevent.extendedProps.estado || '';//estado
      var e_title = clickedevent.title || '';//nombre
      var e_date_start = clickedevent.start ? dateformat(clickedevent.start) : '';//fechaHoraInicio
      var e_date_end = clickedevent.end ? " <i class='text-sm'>to</i> " + dateformat(clickedevent.end) : '';//fechaHoraFin
      // var time_start = clickedevent.start ? timeformat(clickedevent.start) : '';//fechaHoraInicio
      // var time_end = clickedevent.end ? timeformat(clickedevent.end) : '';//fechaHoraInicio
      var e_venue = clickedevent.extendedProps.venue || '';//lugar
      var e_tipo = clickedevent.extendedProps.tipo || '';//tipo
      var e_contacto = clickedevent.extendedProps.contacto || '';
      document.querySelector('.calendar-modal-title').innerHTML = e_title;
      document.querySelector('.pc-event-title').innerHTML = e_title;
      document.querySelector('.pc-event-description').innerHTML = e_desc;
      document.querySelector('.pc-event-date').innerHTML = e_date_start + e_date_end;
      document.querySelector('.pc-event-venue').innerHTML = e_venue;
      document.querySelector('.pc-event-cliente').innerHTML = e_cli;
      document.querySelector('.pc-event-usuario').innerHTML = e_user;
      document.querySelector('.pc-event-enlace').innerHTML = e_link;
      document.querySelector('.pc-event-estado').innerHTML = e_est;
      document.querySelector('.pc-event-tipo').innerHTML = e_tipo;
      document.querySelector('.pc-event-telefono').innerHTML = e_contacto;
      // document.querySelector('.pc-event-horaInicio').innerHTML = time_start;
      // document.querySelector('.pc-event-HoraFin').innerHTML = time_end;
      calendarmodal.show();
    },
  });
  //*esto hace que cada que recuperemos el valor de estado nos devuelva una class de bootstrap
  function colorItem(estado){
    var  estado;
    if(estado== "programada"){
      estado="success";
    }
    if(estado== "completada"){
      estado="success";
    }
    if(estado=="cancelada"){
      estado="danger";
    }
    if(estado=="inactiva"){
      estado="warning";
    }
    if(estado=="confirmada"){
      estado="info";
    }
    if(estado=="pendiente"){
      estado="warning";
    }
    return estado;
  }
  document.addEventListener('DOMContentLoaded', function () {
    // Fetch events from the API
    fetch('/citas') // Reemplaza con la URL de tu API
      .then(response => response.json())
      .then(data => {
        console.log(data);
        data.forEach(event => {
          calendar.addEvent({
            id: event.id,
            cliente: event.Cliente.nombre,
            usuario: event.Usuario.nombre,
            description: event.descripcion,
            documentos: event.documentos,
            enlace: event.enlace,
            estado: event.estado,
            fecha: event.fecha,
            start: event.horaInicio,
            end: event.horaFin,
            venue: event.lugar,
            title: event.nombre,
            tipo: event.tipoCita,
            contacto: event.Cliente.telefono,
            userId: event.usuarioId,
            // className: 'event-info'
            className: 'event-' + colorItem(event.estado.toLowerCase().replace(' ', '-'))
          });
        });
        calendar.render();
      })
      .catch(error => console.error('Error fetching events:', error));
    
    var calbtn = document.querySelectorAll('.fc-toolbar-chunk');
    for (var t = 0; t < calbtn.length; t++) {
      var c = calbtn[t];
      c.children[0].classList.remove('btn-group');
      c.children[0].classList.add('d-inline-flex');
    }
  });
  
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
      console.log(day+end+e_date_start+e_date_end, end);

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
      console.log(title,start, end, allDay, descripcion, venue)
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
  function getTime(temp) {
    temp = new Date(temp);
    if (temp.getHours() != null) {
      var hour = temp.getHours();
      var minute = temp.getMinutes() ? temp.getMinutes() : 00;
      return hour + ':' + minute;
    }
  }
  
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
  })();