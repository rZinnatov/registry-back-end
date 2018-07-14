import { IncomingMessage } from "http";
import * as https from "https";
import * as csv from "csv-parser";

import { Registry } from "../domain/registry";
import { RegistryRecord } from "../domain/registry-record";
/**
 * Responsible for providing registry data.
 */
export class ImportService {
    private csvParserOptions = {
        raw: false, // do not decode to utf-8 strings
        separator: ',', // specify optional cell separator
        quote: '"', // specify optional quote character
        escape: '"', // specify optional escape character (defaults to quote value)
        newline: "\r\n", // specify a newline character
        headers: [ 'id', 'date', 'inventoryId', 'room', 'name', 'amount', 'price', 'comment' ] // Specifing the headers
    };

    /**
     * Imports full registry data to db
     * @param callback got invoked when registry is ready
     */
    public fromGoogleSpreadsheets(spreadsheetId: string): Promise<Registry> {
        const url = `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv`;

        return new Promise<Registry>((resolve, reject) => {
            https.get(url, (response) => {
                try {
                    this.parseCsv(response, (registry) => resolve(registry));
                } catch(e) {
                    reject(e);
                }
            });
        });
    }

    private parseCsv(response: IncomingMessage, callback: (registry: Registry) => void) {
        const records: RegistryRecord[] = [];
        response
            .pipe(csv(this.csvParserOptions))
            .on('data', (record) => records.push(
                new RegistryRecord(
                    record.name ? record.name : '',
                    record.date ? record.date : null,
                    record.inventoryId ? record.inventoryId : null,
                    record.room ? Number(record.room) : null,
                    record.amount ? Number(record.amount) : null,
                    record.price ? Number(record.price) : null,
                    record.comment ? record.comment : null
                ))
            ).on('end', () => callback(new Registry(records)))
        ;
    }
}