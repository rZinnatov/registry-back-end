import { RegistryRecord } from "../domain/registry-record";
import { MongoClient, Db } from "mongodb";

export class RegistryService {
    public insert(records: RegistryRecord[], callback: () => void) {
        MongoClient.connect('mongodb://localhost:27017')
            .then((mongoClient) => {
                const db = mongoClient.db('sir');
                db.collection('records')
                    .insertMany(records)
                    .then(() => {
                        mongoClient.close();
                        callback();
                    })
                    .catch((error) => console.log(error))
                ;
            })
            .catch((error) => console.log(error))
        ;
    }
}