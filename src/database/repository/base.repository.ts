
import { HydratedDocument, Model, PopulateOptions } from "mongoose";


export class DatabaseRepository<TRowDocs>{
    constructor(private model:Model<TRowDocs>){
        this.model = model
    }
    create(data: Partial<TRowDocs>):Promise<HydratedDocument<TRowDocs>>{
        return this.model.create(data)
    }
    findOne(filter:Partial<TRowDocs>,select?:string|Record<string ,0|1>,populate?:PopulateOptions |PopulateOptions[]){//: Query<HydratedDocument<TRowDocs> | null, HydratedDocument<TRowDocs>>
        let doc = this.model.findOne(filter)
        if(select){
            doc = doc.select(select)
        }
        if(populate){
            doc = doc.populate(populate)
        }
        return doc
    }
    findById(id:string,select?:string|Record<string,0|1>,populate?:PopulateOptions |PopulateOptions[]){//: Query<HydratedDocument<TRowDocs> | null, HydratedDocument<TRowDocs>>
        let query = this.model.findById(id)
        if(select) query = query.select(select)
        if(populate) query = query.populate(populate)
        return query
    }
}