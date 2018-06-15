import * as express from "express";
import { RegistryService } from "./registry.service";

/**
 * Responsible for REST API. Processes requests from clients.
 * Uses RAII idiom.
 */
export class ServerService {
    private server = express();

    constructor(
        private registry: RegistryService
    ) {
        this.server.get('/api/v1/data', (request, response) => {
            response.setHeader('Content-Type', 'text/tab-separated-values; charset=utf8');

            this.registry.get((data) => response.send(data))
        });
        this.server.listen(3000, () => console.log('Registry BackEnd is listening on port 3000'));
    }
}