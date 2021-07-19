'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EmpleadoSchema = Schema({
    nombre: String,
    puesto: String,
    departamento: String,
    empresa: {type: Schema.Types.ObjectId, ref: 'usuarios'},
});

module.exports = mongoose.model('empleados', EmpleadoSchema);