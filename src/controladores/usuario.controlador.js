'use strict'

var Usuario = require("../modelos/usuarios.model");
var Empleado = require("../modelos/empleados.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function admin(req, res) {
    var usuarioModel = Usuario();   
    usuarioModel.nombre= "Administrador"
    usuarioModel.rol="ROL_ADMIN"
    Usuario.find({ 
        nombre: "Administrador"
    }).exec((err, adminoEncontrado )=>{
        if(err) return console.log({mensaje: "Error al crear Administrador"});
        if(adminoEncontrado.length >= 1){
        return console.log("El Administrador esta preparado");
        }else{bcrypt.hash("123456", null, null, (err, passwordEncriptada)=>{
            usuarioModel.password = passwordEncriptada;
            usuarioModel.save((err, usuarioguardado)=>{
                if(err) return console.log({mensaje : "Error en la peticion"});
                if(usuarioguardado){console.log("Administrador preparado");
                }else{
                console.log({mensaje:"El administrador no esta listo"});
                }      
            })     
        })
        }
    })
}

function registrarEmpresa(req, res) {
    var usuarioModel = new Usuario();
    var params = req.body;
    if (params.nombre && params.password) {
        usuarioModel.nombre = params.nombre;
        usuarioModel.rol = 'ROL_EMPRESA';
        Usuario.find(
            { nombre: usuarioModel.nombre }
        ).exec((err, usuariosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Empresas' });
            if (usuariosEncontrados && usuariosEncontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'La empresa ya existe' });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, usuarioGuardado) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Empresa' });

                        if (usuarioGuardado) {
                            res.status(200).send({ usuarioGuardado })
                        } else {
                            res.status(404).send({ mensaje: 'No se ha podido registrar la empresa' })
                        }
                    })
                })
            }
        })

    }
}

function login(req, res) {
    var params = req.body;
    Usuario.findOne({nombre: params.nombre}, (err, empresaEncontrada)=>{
        if(err) return res.status(500).send({mensaje: "Error en la petición"});
        if(empresaEncontrada){
            bcrypt.compare(params.password, empresaEncontrada.password, (err, passVerificada)=>{
                if(err) return res.status(500).send({mensaje: "Error en la petición"});
                if(passVerificada){
                     if(params.getToken == "true"){
                        return res.status(200).send({
                        token: jwt.createToken(empresaEncontrada)});
                     }else{
                        empresaEncontrada.password = undefined;
                        return res.status(200).send({empresaEncontrada});
                     }
                }else{
                    return res.status(500).send({mensaje:"La empresa no se a podido identificar"});
                }
            })
        }else{
            return res.status(500).send({mensaje:"Error al buscar la empresa"})
        }
    })
}

function editarEmpresa(req, res) {
    var idUsuario = req.params.id;
    var rol = req.user.rol;
    var params = req.body;
    delete params.password;

    if (rol === 'ROL_ADMIN') {
        Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se a podido editar al Usuario' });

        return res.status(200).send({ usuarioActualizado })
        })
    }else{
        return res.status(500).send({ mensaje: 'No posee los permisos para editar ese usuario' });
    }
    
    
  
}

function eliminarEmpresa(req, res){
    var idUsuario= req.params.id;
    if(req.user.rol === "ROL_EMPRESA"){
        return res.status(500).send({mensaje: "Una empresa no puede eliminar otra empresa"});
    }

    Usuario.deleteMany({nombre: req.user.sub}).exec((err, usuarioactualizado)=>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion"});
        if(!usuarioactualizado) return res.status(500).send({mensaje:"No se ha podido Eliminar la empresa"});
        Usuario.findByIdAndDelete(idUsuario,(err, usuarioEliminado)=>{
            if(err) return res.status(500).send({mensaje:"Error en la peticion"});
            if(!usuarioactualizado) return res.status(500).send({mensaje:"No se ha podido Eliminar la empresa"});
            return res.status(200).send({mensaje: "Se ha eliminado la empresa"});
        })
   })
}

function CantidadEmpleado(req, res) {
    var params = req.body
    var idEmpresa;
    Usuario.findOne({nombre : params.nombre}).exec(
        (err, usuarios) => {
           if(err){res.status(500).send("Error en la peticion");
           }else{
               idEmpresa = usuarios._id;
               Empleado.find({empresa: idEmpresa}).exec((err, datosEmpleados)=>{
                   var Cantidad=0;
                   
                   datosEmpleados.forEach((datosEmpleado)=>{
                    Cantidad++;
                   })
                   return res.status(200).send({ Cantidad });   
                });
            }
        }
    )
}

module.exports = {
    admin,
    registrarEmpresa,
    login,
    editarEmpresa,
    eliminarEmpresa,
    CantidadEmpleado
}
