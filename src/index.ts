import * as Express from "express";
import * as https from "https";

const server = Express();
const dataUrl = `https://docs.google.com/spreadsheets/d/e/${process.env.SPREADSHEET_ID}/pub?output=tsv`;
server.get('/api/v1/data', (request, response) => {
    response.setHeader('Content-Type', 'text/plain; charset=utf8');
    https.get(dataUrl, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk.toString();
        });
        resp.on('end', () => {
            console.log('end');
            response.send(data);
        });
        resp.on('close', () => {
            console.log('close');
        });
    });
});
server.listen(3000, () => console.log('Registry BackEnd is listening on port 3000'));