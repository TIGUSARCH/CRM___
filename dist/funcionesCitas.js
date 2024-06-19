

document.addEventListener('DOMContentLoaded', function(event) {
    
    fetchData();
    fetchCliente();
  });


// esta funcion llena el combo box de  usuario
const selectElement = document.getElementById('crear-cita-usuario');
    const fetchData = async () => {
        try {
            const response = await fetch('/usuarios'); // Reemplaza con tu URL de la API
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            fillSelect(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // Función para llenar el select con los datos obtenidos
    const fillSelect = (data) => {
        data.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id; // Asigna el valor según tu estructura de datos
            option.textContent = item.nombre; // Asigna el texto según tu estructura de datos
            selectElement.appendChild(option);
        });
    };

//esta funcion llena el el sect de clientes
const selectCliente = document.getElementById('crear-cita-cliente');
    const fetchCliente = async () => {
        try {
            const response = await fetch('/clientes'); // Reemplaza con tu URL de la API
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            fillSelectClientes(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // Función para llenar el select con los datos obtenidos
    const fillSelectClientes = (data) => {
        data.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id; // Asigna el valor según tu estructura de datos
            option.textContent = item.nombre+" "+item.apellidoPaterno+" "+item.apellidoMaterno; // Asigna el texto según tu estructura de datos
            selectCliente.appendChild(option);
        });
    };

    // funcion para crear una cita nueva
    // document.getElementById('botonCrearCita').addEventListener('click', async function() {
    //     const nombre = document.getElementById('crear-cita-nombre').value;
    //     const descripcion = document.getElementById('crear-cita-descripcion').value;
    //     const fecha = document.getElementById('crear-cita-fecha').value;
    //     const horaInicio = document.getElementById('crear-cita-hora-inicio').value;
    //     const horaFin = document.getElementById('crear-cita-hora-fin').value;
    //     const lugar = document.getElementById('crear-cita-lugar').value;
    //     const estado = document.getElementById('crear-cita-estado').value;
    //     const enlace = document.getElementById('crear-cita-enlace').value;
    //     const usuario = document.getElementById('crear-cita-usuario').value;
    //     const cliente = document.getElementById('crear-cita-cliente').value;

    //     var FH1= fechaHora = fecha+'T'+horaInicio
    //     var momento = moment(FH1).utcOffset('-06:00');
    //     var fechaFormateada = momento.format('YYYY-MM-DD HH:mm:ssZ');
    //     const tipoCita = 'reunion';
    //     const data = {
    //      nombre: nombre 
    //      ,descripcion:descripcion
    //      ,tipoCita: tipoCita
    //      ,fecha:fechaFormateada
    //      ,horaInicio: fechaFormateada
    //      ,horaFin: fechaFormateada
    //      ,lugar: lugar
    //      ,estado: estado
    //      ,enlace: enlace
    //      ,usuarioId: usuario
    //      ,clienteId: cliente
    //     };
    //     console.log(data);
    //     try {
    //         const response = await fetch('/citas', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(data)
    //         });
            
    //         const responseData = await response.json();

    //         console.log(responseData);

    //         if (response.ok) {
    //             // Mostrar un mensaje de éxito, cerrar el modal, etc.
                
    //             iziToast.success({
    //               title: 'Éxito',
    //               message: 'Se guardo correctamente',
    //               position: 'topRight'
    //             });  
    //         } else if (response.status === 409) {
    //           iziToast.warning({
    //             title: 'Cuidado',
    //             message: 'Ese correo ya lo usa otro cliente',
    //             position: 'topRight'
    //           });
    //         } else if (response.status === 400) {
    //           iziToast.warning({
    //             title: 'Cuidado',
    //             message: 'Debes llenar todos los campos',
    //             position: 'topRight'
    //           });
    //       } else {
    //             // Mostrar un mensaje de error, etc.
    //             console.error('Error al guardar el cliente');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    //   });