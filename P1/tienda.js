const http = require('http');
const fs = require('fs');

const port = 8080;
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

    else if (url.pathname === '/ls' || url.pathname.startsWith('/ls/')) {
        const pathLocal = '.' + url.pathname.replace('/ls', '');

        fs.stat(pathLocal, (err, stats) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>Error 404: Recurso no encontrado</h1>');
                return;
            }

            if (stats.isDirectory()) {
                fs.readdir(pathLocal, { withFileTypes: true }, (err, files) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('<h1>Error al listar los archivos</h1>');
                        return;
                    }

                    const listado = files
                        .filter(file => !file.name.startsWith('.') && file.name !== 'S2' && file.name !== 'S3')
                        .map(file => {
                            const href = url.pathname + (url.pathname.endsWith('/') ? '' : '/') + file.name;
                            const displayName = file.isDirectory() ? `[${file.name}]` : file.name;
                            return `<li><a href="${href}">${displayName}</a></li>`;
                        })
                        .join('');

                    const html = `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <title>Listado de Archivos</title>
                            <style>
                                body { font-family: Arial; padding: 20px; background: #f5f5f5; }
                                h1 { color: #990000; }
                                ul { background: white; padding: 20px; border-radius: 10px; }
                                li { margin: 10px 0; }
                                a { text-decoration: none; color: #0077cc; }
                                a:hover { text-decoration: underline; }
                            </style>
                        </head>
                        <body>
                            <h1>Archivos en: ${url.pathname.replace('/ls', '') || '/'}</h1>
                            <ul>${listado}</ul>
                            <a href="/ls" style="display: inline-block; margin-top: 20px;">⬅ Volver a /ls</a>
                            <br><a href="/index.html" style="display: inline-block; margin-top: 10px;">🏠 Ir al inicio</a>
                        </body>
                        </html>
                    `;

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                });
            } else {
                // Si es un archivo, lo servimos directamente
                const ext = pathLocal.split('.').pop();
                let contentType = 'application/octet-stream';
                if (ext === 'html') contentType = 'text/html';
                else if (ext === 'css') contentType = 'text/css';
                else if (ext === 'js') contentType = 'application/javascript';
                else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
                else if (ext === 'webp') contentType = 'image/webp';
                else if (ext === 'png') contentType = 'image/png';

                fs.readFile(pathLocal, (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('<h1>Error al abrir el archivo</h1>');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                });
            }
        });
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
