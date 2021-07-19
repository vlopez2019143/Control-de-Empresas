'use strict'
var Empleado = require("../modelos/empleados.model");
var Usuario = require("../modelos/usuarios.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const { replaceOne } = require("../modelos/empleados.model");
var fs = require('fs');
var PDFDocument = require('pdfkit');

function registrarEmpleado(req, res) {
    var usuarioModel = new Empleado();
    var params = req.body;
    if (params.nombre) {
        usuarioModel.nombre = params.nombre;
        usuarioModel.puesto = params.puesto;
        usuarioModel.departamento = params.departamento;
        usuarioModel.empresa = req.user.sub;
        Empleado.find({ nombre: usuarioModel.nombre }).exec((err, empleadosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Empleados' });
            if (empleadosEncontrados && empleadosEncontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'El empleado ya existe' });
            } else {

                usuarioModel.save((err, empleadoGuardado) => {

                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar el empleado' });

                    if (empleadoGuardado) {
                        res.status(200).send({ empleadoGuardado })
                    } else {
                        res.status(404).send({ mensaje: 'No se ha podido registrar el usuario' })
                    }
                })

            }
        })

    }
}

function editarEmpleado(req, res) {
    var idEmpleado = req.params.id;
    var params = req.body;
    var idEmpresa = req.params.id2;
    delete params.password;

    if (idEmpresa === req.user.sub) {
        Empleado.findByIdAndUpdate(idEmpleado, params, { new: true }, (err, empleadoActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!empleadoActualizado) return res.status(500).send({ mensaje: 'No se a podido editar al Empleado' });

            return res.status(200).send({ empleadoActualizado })
        })
    } else {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar el empleado de ptras empresas' });
    }



}

function eliminarEmpleado(req, res) {
    var idEmpleado = req.params.id;
    var idEmpresa = req.params.id2;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: "No puede eliminar este Empleado" });
    }else{
        Empleado.deleteMany({ nombre: req.user.sub }).exec((err, empleadoEliminado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!empleadoEliminado) return res.status(500).send({ mensaje: "No se ha podido Eliminar el empleado" });
        Empleado.findByIdAndDelete(idEmpleado, (err, empleadoEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!empleadoEliminado) return res.status(500).send({ mensaje: "No se ha podido Eliminar el empleado" });
            return res.status(200).send({ mensaje: "Se ha eliminado el empleado" });
        })
        })
    }

    
}

function buscarId(req, res) {   
    var idEmpresa = req.user.sub;
    var empresaEmpleadoId = req.params.id;
    var empleado = req.params.id2;
    if (idEmpresa != empresaEmpleadoId) {
        return res.status(500).send({ mensaje: "No esta su empresa o no tiene datos" });
        
    }else{
        
        Empleado.findOne({_id : empleado, empresa: empresaEmpleadoId}).exec(
        (err, empleados) => {
           if(err){res.status(500).send("Error en la peticion");
           
           }else{
            return res.status(200).send({ empleados });
           }
        }  )
    }
}

function buscarNombre(req, res) {
    var idEmpresa = req.user.sub;
    var empresaEmpleadoId = req.params.id;
    var params = req.body

    if (idEmpresa != empresaEmpleadoId) {
        return res.status(500).send({ mensaje: "No esta su empresa o no tiene datos" });
        
    }else{
        
        Empleado.findOne({nombre : params.nombre, empresa: empresaEmpleadoId}).exec(
        (err, empleados) => {
           if(err){res.status(500).send("Error en la peticion");
           }else{
            if (!empleados) return res.status(500).send({mensaje: "No tienes empleados con ese nombre"})
            return res.status(200).send({ empleados });
           }
        }  )
    }
  
}

function buscarPuesto(req, res) {
    var idEmpresa = req.user.sub;
    var empresaEmpleadoId = req.params.id;
    var params = req.body
    
    if (idEmpresa != empresaEmpleadoId) {
        return res.status(500).send({ mensaje: "No esta su empresa o no tiene datos" });
        
    }else{
        Empleado.find({puesto : params.puesto, empresa: empresaEmpleadoId}).exec(
            (err, empleados) => {
            if(err){res.status(500).send("Error en la peticion");
            }else{
                if (!empleados) return res.status(500).send({mensaje: "No tienes empleados con ese puesto"})
                return res.status(200).send({ empleados });
            }
            }
        )
    }

    
}

function buscarDepto(req, res) {
    var idEmpresa = req.user.sub;
    var empresaEmpleadoId = req.params.id;
    var params = req.body
    
    if (idEmpresa != empresaEmpleadoId) {
        return res.status(500).send({ mensaje: "No esta su empresa o no tiene datos" });
        
    }else{
        Empleado.find({departamento : params.departamento, empresa: empresaEmpleadoId}).exec(
            (err, empleados) => {
            if(err){res.status(500).send("Error en la peticion");
            }else{
                if (!empleados){
                    return res.status(500).send({ mensaje: "No tiene un departamento con ese nombre" });
                }else{
                    return res.status(200).send({ empleados });
                }
            }
            }
        )
    }

    
}

function Generarpdf(req, res){
    var idEmpresa = req.user.sub;
    var empresaEmpleadoId = req.params.id;
    var params = req.body
    if (idEmpresa != empresaEmpleadoId) {
        return res.status(500).send({ mensaje: "No esta su empresa o no tiene datos" });
    }else{Empleado.find({ empresa: empresaEmpleadoId }).exec(
        (err, empleados) => {
            if(err){res.status(500).send("Error en la peticion");
        }else{
                
            var PDFDocument = require('pdfkit');
            var pdf = new PDFDocument({
                size: 'LEGAL',
                info: {
                Title: 'ListaUsuario.pdf',
                Author: 'Aldanasa',
                }
                });
                   
                pdf.text("Estos son los empleados de la empresa: ");
                pdf.text("          ");
                pdf.text(req.user.nombre);
                pdf.text("          ");
                pdf.text(empleados);
                
                pdf.pipe(fs.createWriteStream('ListaUsuario.pdf')).on('finish', function () {
                    console.log('PDF closed');
                });
                pdf.end();
            }
        }
    )}        
}

module.exports = {
    registrarEmpleado,
    editarEmpleado,
    eliminarEmpleado,
    buscarId,
    buscarNombre,
    buscarPuesto,
    buscarDepto,
    Generarpdf
}