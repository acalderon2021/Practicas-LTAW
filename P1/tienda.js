


const http = require('http');
const fs = require('fs');


const port = 8001;
const tienda = "index.html";
const styles = "styles.css"; 
const errorPage = "error.html"; 

//-- Crear el servidor
const server = http.createServer((req, res) => {
    let url = new URL(req.url, 'http://' + req.headers['host']);

    
    let recursos = "";

    if (url.pathname == '/' || url.pathname == '/index.html') {
        recursos += tienda;

        //-- Leer fichero index.html
        fs.readFile(tienda, (err, data) => {
            if (err) { 
                res.setHeader('Content-Type', 'text/html');
                fs.readFile(errorPage, (err, errorData) => {
                    if (err) {
                        res.write("<h1>Error 404: Recurso no encontrado</h1>");
                    } else {
                        res.write(errorData);
                    }
                    res.end();
                });
            }
            else {  
                res.setHeader('Content-Type','text/html');
                res.write(data);
                res.end();
            }
        })
    }
    else if (url.pathname == '/styles.css') { 
        recursos += styles;

        fs.readFile(recursos, (err, data) => {
            if (err) {
                res.setHeader('Content-Type', 'text/html');
                fs.readFile(errorPage, (err, errorData) => {
                    if (err) {
                        res.write("<h1>Error 404: Recurso no encontrado</h1>");
                    } else {
                        res.write(errorData);
                    }
                    res.end();
                });
            }
            else {  
                res.setHeader('Content-Type', 'text/css');
                res.write(data);
                res.end();
            }
        })
    }
    else {
        recursos += url.pathname.substring(1);  

        fs.readFile(recursos, (err, data) => {
            if (err) { 
                res.setHeader('Content-Type', 'text/html');
                fs.readFile(errorPage, (err, errorData) => {
                    if (err) {
                        res.write("<h1>Error 404: Recurso no encontrado</h1>");
                    } else {
                        res.write(errorData);
                    }
                    res.end();
                });
            }
            else {  
                res.setHeader('Content-Type', 'text/html');
                res.write(data);
                res.end();
            }
        })
    }
});


server.listen(port);
console.log("¡Tienda abierta!. Servidor escuchando en puerto: " + port);
