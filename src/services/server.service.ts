import * as express from "express";
import { ImportService } from "./import.service";
import { RegistryService } from "./registry.service";
/**
 * Responsible for REST API. Processes requests from clients.
 * Uses RAII idiom.
 */
export class ServerService {
    private _server: any;
    private _apiPath: string;
    /**
     * Creates and initializes an instance of the ServerService class
     */
    constructor(
        private _import: ImportService,
        private _registry: RegistryService
    ) {
        this._apiPath = '/api/v1';
        // <-- Init express js app -->
        this._server = express();
        this._server.use((request, response, next) => {
            response.setHeader('Content-Type', 'application/json; charset=utf8');
            next();
        });
        this._server.get(`${this._apiPath}/registry/import/gs/:spreadsheetId`, this.importFromGoogleSpreadsheets.bind(this));
        this._server.listen(3000, () => console.log('Registry BackEnd is listening on port 3000'));
        // </- Init express js app -->
    }

    private importFromGoogleSpreadsheets(request, response) {
        const self = this;
        this._import.fromGoogleSpreadsheets(
            request.params.spreadsheetId,
            (registry) => {
                self._registry.insert(
                    registry.records,
                    () => response.send(JSON.stringify({ isOk: true }))
                );
            }
        );
    }
}