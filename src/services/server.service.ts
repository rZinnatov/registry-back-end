import * as express from "express";
import { RegistryService } from "./registry.service";
/**
 * Responsible for REST API. Processes requests from clients.
 * Uses RAII idiom.
 */
export class ServerService {
    private server: any;
    private apiPath: string;
    /**
     * Creates and initializes an instance of the ServerService class
     */
    constructor(
        private registry: RegistryService
    ) {
        this.apiPath = '/api/v1';
        // <-- Init express js app -->
        this.server = express();
        this.server.use((request, response, next) => {
            response.setHeader('Content-Type', 'application/json; charset=utf8');
            next();
        });
        this.server.get(`${this.apiPath}/registry`, (request, response) => {
            this.registry.get(
                (registry) => response.send(JSON.stringify(registry))
            );
        });
        this.server.listen(3000, () => console.log('Registry BackEnd is listening on port 3000'));
        // </- Init express js app -->
    }
}