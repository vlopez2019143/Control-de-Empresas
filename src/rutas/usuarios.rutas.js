'use strict'

var express = require("express");
var UsuarioControlador = require("../controladores/usuario.controlador");
var md_autorizacion = require("../middlewares/authenticated.js");
var EmpleadoControlador = require("../controladores/empleados.controlador");
var api = express.Router()

//Empresas

api.post("/registrarEmpresa", UsuarioControlador.registrarEmpresa);
api.post("/login", UsuarioControlador.login);
api.put('/editarEmpresa/:id', md_autorizacion.ensureAuth, UsuarioControlador.editarEmpresa);
api.put("/eliminarEmpresa/:id", md_autorizacion.ensureAuth, UsuarioControlador.eliminarEmpresa);
api.post('/CantidadEmpleado', UsuarioControlador.CantidadEmpleado);

//Empleados

api.post("/registrarEmpleado", md_autorizacion.ensureAuth, EmpleadoControlador.registrarEmpleado);
api.put("/editarEmpleado/:id/:id2", md_autorizacion.ensureAuth, EmpleadoControlador.editarEmpleado);
api.put("/eliminarEmpleado/:id/:id2", md_autorizacion.ensureAuth, EmpleadoControlador.eliminarEmpleado);
api.put('/buscarId/:id/:id2', md_autorizacion.ensureAuth, EmpleadoControlador.buscarId);
api.put('/buscarNombre/:id', md_autorizacion.ensureAuth, EmpleadoControlador.buscarNombre);
api.put('/buscarPuesto/:id', md_autorizacion.ensureAuth, EmpleadoControlador.buscarPuesto);
api.put('/buscarDepto/:id', md_autorizacion.ensureAuth, EmpleadoControlador.buscarDepto);
api.put('/Generarpdf/:id', md_autorizacion.ensureAuth,EmpleadoControlador.Generarpdf);

module.exports = api;