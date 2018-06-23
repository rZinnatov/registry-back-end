import { MongoClient, Collection } from "mongodb";
import { RegistryRecord } from "../domain/registry-record";
import { Registry } from "../domain/registry";

export class RegistryService {
    public getAll(callback: (registry: Registry) => void) {
        this._getCollection((mongoClient, collection) => {
            collection.find().toArray()
                .then((records: RegistryRecord[]) => {
                    mongoClient.close();
                    callback(new Registry(records));
                })
                .catch((error) => console.log(error))
            ;
        });
    }
    public add(records: RegistryRecord[], callback: () => void) {
        this._getCollection((mongoClient, collection) => {
            collection.insertMany(records)
                .then(() => {
                    mongoClient.close();
                    callback();
                })
                .catch((error) => console.log(error))
            ; 
        });
    }

    private _getCollection(callback: (mongoClient: MongoClient, collection: Collection<any>) => void) {
        MongoClient.connect('mongodb://localhost:27017')
            .then((mongoClient) => {
                const db = mongoClient.db('sir');
                const collection = db.collection('records');
                callback(mongoClient, collection);
            })
            .catch((error) => console.log(error))
        ;
    }
}