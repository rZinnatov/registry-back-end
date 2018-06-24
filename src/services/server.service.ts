import * as express from "express";
import * as bodyParser from "body-parser";
import { ImportService } from "./import.service";
import { RegistryService } from "./registry.service";
import { RegistryRecord } from "../domain/registry-record";
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
        this._server.use(bodyParser.json());
        this._server.use((request, response, next) => {
            response.setHeader('Content-Type', 'application/json; charset=utf8');
            next();
        });
        // <-- Records -->
        this._server.get(`${this._apiPath}/registry`, this.fetchRegistry.bind(this));
        this._server.put(`${this._apiPath}/registry`, this.addRegistryRecord.bind(this));
        this._server.post(`${this._apiPath}/registry`, this.updateRegistryRecord.bind(this));
        this._server.delete(`${this._apiPath}/registry/:id`, this.removeRegistryRecord.bind(this));
        // </- Records -->
        this._server.get(`${this._apiPath}/registry/import/gs/:spreadsheetId`, this.importFromGoogleSpreadsheets.bind(this));
        this._server.listen(process.env.PORT || 3000, () => console.log('Registry BackEnd is listening on port 3000'));
        // </- Init express js app -->
    }

    private fetchRegistry(request, response) {
        const self = this;
        self._registry.getAll(
            (registry) => response.send(JSON.stringify(registry))
        );
    }
    private addRegistryRecord(request, response) {
        const self = this;
        // TODO: Validate body
        self._registry.addOne(
            new RegistryRecord(
                request.body.name,
                request.body.date,
                request.body.inventoryId,
                request.body.room,
                request.body.amount,
                request.body.price,
                request.body.comment
            ),
            (id: string) => response.send(JSON.stringify({ isOk: true, id: id }))
        );
    }
    private updateRegistryRecord(request, response) {
        const self = this;
        // TODO: Validate body
        const record = new RegistryRecord(
            request.body.name,
            request.body.date,
            request.body.inventoryId,
            request.body.room,
            request.body.amount,
            request.body.price,
            request.body.comment
        );
        record.id = request.body.id
        self._registry.updateOne(
            record,
            () => response.send(JSON.stringify({ isOk: true }))
        );
    }
    private removeRegistryRecord(request, response) {
        const self = this;
        self._registry.remove(
            request.params.id,
            () => response.send(JSON.stringify({ isOk: true }))
        );
    }
    private importFromGoogleSpreadsheets(request, response) {
        const self = this;
        self._import.fromGoogleSpreadsheets(
            request.params.spreadsheetId,
            (registry) => {
                self._registry.addMany(
                    registry.records,
                    () => response.send(JSON.stringify({ isOk: true }))
                );
            }
        );
    }
}