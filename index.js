const mongoose =  require("mongoose")
const app = require("./app")
var UsuarioControlador = require("./src/controladores/usuario.controlador");

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/EmpresaF', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log('Se encuentra conectado a la base de datos');

    app.listen(3000, function () {
        console.log("Servidor corriendo en el puerto 3000");
        UsuarioControlador.admin();
    })
}).catch(err => console.log(err))