const http = require("http");
const url = require("url");
const { readFileSync, writeFileSync } = require("fs");
const port = 3000;
const { v4: uuidv4 } = require('uuid');

const newId = uuidv4();

const dataAnime = `${__dirname}/anime.json`

const servidor = http.createServer((req, res) => {
    const metodo = req.method;
    const urlParsed = url.parse(req.url, true)
    const pathName = urlParsed.pathname
    res.setHeader("Content-Type", "application/json");

    if (pathName == "/anime") {
        if (metodo == "GET") {
            const params = urlParsed.query;
            const contentString = readFileSync(dataAnime, "utf-8");
            let contentJS = JSON.parse(contentString);
            if (params.id) {
                const anime = contentJS[params.id];
                if (anime) {
                    res.end(JSON.stringify({ message: "Anime encontrado", data: anime }));
                    return
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: "Anime no encontrado" }));
                    return;
                }
            }
            res.end(JSON.stringify({ message: "Listado de animes", data: contentJS }))

        } else if (metodo == "POST") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString()
            })

            req.on("end", () => {
                body = JSON.parse(body);
                const contentString = readFileSync(dataAnime, "utf-8");
                const contentJS = JSON.parse(contentString);

                const anime = {
                    nombre: body.nombre,
                    genero: body.genero,
                    año: body.año,
                    autor: body.autor
                }

                contentJS[newId] = anime;
                writeFileSync(dataAnime, JSON.stringify(contentJS), "utf-8");

                res.writeHead(201);
                res.end(JSON.stringify({ message: "Registro exitoso", data: anime }));
            })

        } else if (metodo == "PUT") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString()
            })

            req.on("end", () => {
                body = JSON.parse(body);
                const contentString = readFileSync(dataAnime, "utf-8");
                let contentJS = JSON.parse(contentString);

                const id = body.id;
                if (contentJS[id]) {
                    contentJS[id] = { ...contentJS[id], ...body };
                    writeFileSync(dataAnime, JSON.stringify(contentJS, "utf-8"));
                    res.writeHead(200);
                    return res.end(JSON.stringify({ message: "Anime actualizado con éxito", data: contentJS[id] }));
                } else res.writeHead(409)
                return res.end(JSON.stringify({ message: "Id de anime no encontrado" }));

            
            });

        } else if (metodo == "DELETE") {
            const params = urlParsed.query;
            const contentString = readFileSync(dataAnime, "utf-8");
            let contentJS = JSON.parse(contentString);
            if (!params.id) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "ID es obligatorio" }));
                return;
            } else {
                const anime = contentJS[params.id];
                if (anime) {
                    delete contentJS[params.id];
                    writeFileSync(dataAnime, JSON.stringify(contentJS), "utf-8")
                    return res.end(JSON.stringify({ message: "Anime eliminado", data: anime }))
                }
            }
        }
    }

}).listen(port, () => {
    console.log(`Aplicación ejecutandose por el puerto ${port}`);
})