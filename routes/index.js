// routes/index.js
const express = require('express');
const router = express.Router();
const path = require('path');
const Usuario = require('../models/usuario'); 
const Rol = require('../models/rol'); 

const authMiddleware = require('../middlewares/authMiddleware');

const usuariosController = require('../controllers/usuariosController');
const clientesController = require('../controllers/clientesController');
const rolesController = require('../controllers/rolesController');
const tareasController = require('../controllers/tareasController');
const eventosController = require('../controllers/eventosController');
const citasController = require('../controllers/citasController');
const documentosController = require('../controllers/documentosController');
const disponibilidadController = require('../controllers/disponibilidadController');
const participantesCitasController = require('../controllers/participantesCitasController');

// //* web push notification 

const webpush = require("../webpush");
let pushSubscripton;

router.post("/subscription", async (req, res) => {
  pushSubscripton = req.body;
  console.log(pushSubscripton);

  // Server's Response
  res.status(201).json();
});

router.post("/new-message", async (req, res) => {
  const { title,message } = req.body;
  // Payload Notification
  const payload = JSON.stringify({
    title,
    message 
  });
  res.status(200).json();
  try {
    await webpush.sendNotification(pushSubscripton, payload);
    console.log( pushSubscripton, payload)
  } catch (error) {
    console.log(error);
  }
});


const multer = require('multer');
const { title } = require('process');

// Configurar Multer para manejar archivos adjuntos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directorio donde se guardarán los archivos adjuntos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Utilizar el nombre original del archivo
  }
});
const upload = multer({ storage: storage });

// Parsear datos JSON en las solicitudes POST
router.use(express.json());

router.post('/usuarios', usuariosController.crearUsuario);
router.get('/usuarios', usuariosController.obtenerUsuarios);
router.get('/usuarios/:id', usuariosController.obtenerUsuarioPorId);
router.put('/usuarios/:id', usuariosController.actualizarUsuario);
router.delete('/usuarios/:id', usuariosController.eliminarUsuario);

router.post('/clientes', clientesController.crearCliente);
router.get('/clientes', clientesController.obtenerClientes);
router.get('/clientes/:id', clientesController.obtenerClientePorId);
router.put('/clientes/:id', clientesController.actualizarCliente);
router.delete('/clientes/:id', clientesController.eliminarCliente);

router.post('/roles', rolesController.crearRol);
router.get('/roles', rolesController.obtenerRoles);
router.get('/roles/:id', rolesController.obtenerRolPorId);
router.put('/roles/:id', rolesController.actualizarRol);
router.delete('/roles/:id', rolesController.eliminarRol);

router.post('/tareas', tareasController.crearTarea);
router.get('/tareas', tareasController.obtenerTareas);
router.get('/tareas/:id', tareasController.obtenerTareaPorId);
router.put('/tareas/:id', tareasController.actualizarTarea);
router.patch('/tareas/:id/estado', tareasController.actualizarEstadoTarea);
router.delete('/tareas/:id', tareasController.eliminarTarea);

router.post('/eventos', eventosController.crearEvento);
router.get('/eventos', eventosController.obtenerEventos);
router.get('/eventos/:id', eventosController.obtenerEventoPorId);
router.put('/eventos/:id', eventosController.actualizarEvento);
router.patch('/eventos/:id/estado', eventosController.actualizarEstadoEvento);
router.delete('/eventos/:id', eventosController.eliminarEvento);

// Definir las rutas y asignar los controladores correspondientes
router.get('/citas', citasController.obtenerCitas);
router.post('/citas', citasController.crearCita);
router.get('/citas/:id', citasController.obtenerCitaPorId);
router.put('/citas/:id', citasController.actualizarCita);
router.patch('/citas/:id/estado', citasController.actualizarEstadoCita);
router.delete('/citas/:id', citasController.eliminarCita);

router.post('/documentos', documentosController.crearDocumento);
router.get('/documentos', documentosController.obtenerDocumentos);
router.get('/documentos/:id', documentosController.obtenerDocumentoPorId);
router.put('/documentos/:id', documentosController.actualizarDocumento);
router.delete('/documentos/:id', documentosController.eliminarDocumento);

router.post('/disponibilidad', disponibilidadController.crearDisponibilidad);
router.get('/disponibilidad', disponibilidadController.obtenerDisponibilidad);
router.get('/disponibilidad/:id', disponibilidadController.obtenerDisponibilidadPorId);
router.put('/disponibilidad/:id', disponibilidadController.actualizarDisponibilidad);
router.get('/disponibilidad/horarios', disponibilidadController.obtenerDisponibilidadHorarios);
router.delete('/disponibilidad/:id', disponibilidadController.eliminarDisponibilidad);

router.post('/participantesCitas', participantesCitasController.agregarParticipante);
router.get('/participantesCitas', participantesCitasController.obtenerParticipantes);
router.get('/participantesCitas/:id', participantesCitasController.obtenerParticipantePorId);
router.put('/participantesCitas/:id', participantesCitasController.actualizarParticipante);
router.delete('/participantesCitas/:id', participantesCitasController.eliminarParticipante);

router.get('/dev', authMiddleware(), async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.session.userId, { include: [Rol] });
        const esAdmin = usuario.Rol.tipo === 'Administrador';
        res.render('application/dev', { userId: req.session.userId, esAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
})

router.get('/login', (req, res) => {
    res.render('pages/login');
});


router.get('/prov', (req, res) => {
    res.render('application/prov');
});

router.get('/', authMiddleware(['Colaborador', 'Administrador']), (req, res) => {
    res.render('application/calendar1');
});


router.get('/home', authMiddleware(['Colaborador', 'Administrador']), (req, res) => {
    res.render('application/home');
});
/* dist\application\ecom_product-list.ejs */
router.get('/ecom_product-list', (req, res) => {
    res.render('application/ecom_product-list');
});

router.get('/ecom_product-add', (req, res) => {
    res.render('application/ecom_product-add');
});

/* Forms_Elements */
router.get('/form_elements', (req, res) => {
    res.render('forms/form_elements');
});

router.get('/form_floating', (req, res) => {
    res.render('forms/form_floating');
});

router.get('/form2_basic', (req, res) => {
    res.render('forms/form2_basic');
});

router.get('/form2_input_group', (req, res) => {
    res.render('forms/form2_input_group');
});

router.get('/form2_checkbox', (req, res) => {
    res.render('forms/form2_checkbox');
});

router.get('/form2_radio', (req, res) => {
    res.render('forms/form2_radio');
});

router.get('/form2_switch', (req, res) => {
    res.render('forms/form2_switch');
});

router.get('/form2_megaoption', (req, res) => {
    res.render('forms/form2_megaoption');
});
/* End_Forms_Elements */


/* Forms_Plugins */
router.get('/form2_datepicker', (req, res) => {
    res.render('forms/form2_datepicker');
});

router.get('/form2_daterangepicker', (req, res) => {
    res.render('forms/form2_daterangepicker');
});

router.get('/form2_timepicker', (req, res) => {
    res.render('forms/form2_timepicker');
});

router.get('/form2_choices', (req, res) => {
    res.render('forms/form2_choices');
});

router.get('/form2_recaptcha', (req, res) => {
    res.render('forms/form2_recaptcha');
});

router.get('/form2_inputmask', (req, res) => {
    res.render('forms/form2_inputmask');
});

router.get('/form2_clipboard', (req, res) => {
    res.render('forms/form2_clipboard');
});

router.get('/form2_nouislider', (req, res) => {
    res.render('forms/form2_nouislider');
});

router.get('/form2_switchjs', (req, res) => {
    res.render('forms/form2_switchjs');
});

router.get('/form2_typeahead', (req, res) => {
    res.render('forms/form2_typeahead');
});
/* End_Forms_Plugins */
router.get('/form2_typeahead', (req, res) => {
    res.render('forms/form2_typeahead');
});

/* Rutas para los formularios en donde agregaremos los eventos */
router.get('/add-evento', (req, res) => {
    res.render('forms/add-evento');
});

// Ruta para servir la vista calendar
router.get('/calendar', authMiddleware(['Colaborador', 'Administrador']), (req, res) => {
    res.render('application/calendar');
});

// Ruta para servir la vista dashboard
router.get('/dashboard', (req, res) => {
    res.render('dashboard/index');
});


router.get('/analytics', (req, res) => {
    res.render('dashboard/analytics');  
});

//! Esto lo agregue yo
// router.get('/gestion-clientes', (req, res) => {
//     res.render('application/clientes');  
// });

// router.get('/gestion-usuarios', (req, res) => {
//     res.render('application/usuarios');  
// });
router.get('/pruebas', (req, res) => {
    res.render('application/pruebas');  
});

router.get('/msgAuth', (req, res) => {
    res.render('pages/msgAuth');  
});

router.get('/gestion-clientes', authMiddleware(['Colaborador', 'Administrador']), (req, res) => {
    res.render('application/clientes');  
});

router.get('/gestion-usuarios',authMiddleware(['Administrador']), (req, res) => {
    res.render('application/usuarios');  
});


module.exports = router;
