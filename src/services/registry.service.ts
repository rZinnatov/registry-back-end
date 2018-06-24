import { MongoClient, Collection, ObjectID } from "mongodb";
import { RegistryRecord } from "../domain/registry-record";
import { Registry } from "../domain/registry";

export class RegistryService {
    public getAll(callback: (registry: Registry) => void) {
        const self = this;
        self._getCollection((mongoClient, collection) => {
            collection.find().toArray()
                .then((records: RegistryRecord[]) => {
                    mongoClient.close();
                    callback(new Registry(records));
                })
                .catch(self._errorHandler)
            ;
        });
    }
    public addOne(record: RegistryRecord, callback: (id: string) => void) {
        const self = this;
        self._getCollection((mongoClient, collection) => {
            collection.insertOne(record)
                .then((result) => {
                    mongoClient.close();
                    callback(result.insertedId.toHexString());
                })
                .catch(self._errorHandler)
            ; 
        });
    }
    public addMany(records: RegistryRecord[], callback: () => void) {
        const self = this;
        self._getCollection((mongoClient, collection) => {
            collection.insertMany(records)
                .then(() => {
                    mongoClient.close();
                    callback();
                })
                .catch(self._errorHandler)
            ; 
        });
    }
    public updateOne(record: RegistryRecord, callback: () => void) {
        const self = this;
        self._getCollection((mongoClient, collection) => {
            collection.replaceOne({ '_id': new ObjectID(record.id) }, record)
                .then(() => {
                    mongoClient.close();
                    callback();
                })
                .catch(self._errorHandler)
            ; 
        });
    }
    public remove(id: string, callback: () => void) {
        const self = this;
        self._getCollection((mongoClient, collection) => {
            collection.deleteOne({ '_id': new ObjectID(id) })
                .then(() => {
                    mongoClient.close();
                    callback();
                })
                .catch(self._errorHandler)
            ; 
        });
    }

    private _errorHandler(error: any) {
        if (error) {
            console.log(`Error: ${error}`);
        }
    }
    private _getCollection(callback: (mongoClient: MongoClient, collection: Collection<any>) => void) {
        MongoClient.connect(process.env.SIR_CONNECTION_STRING || 'mongodb://localhost:27017')
            .then((mongoClient) => {
                const db = mongoClient.db('sir');
                const collection = db.collection('records');
                callback(mongoClient, collection);
            })
            .catch((error) => console.log(error))
        ;
    }
}