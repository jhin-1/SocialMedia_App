import {createClient, RedisClientType} from 'redis';
import { env } from '../../config/env.service';
import { Types } from 'mongoose';
import { NotFoundException } from '../exceptions/applecation.excptions';


export class RedisService {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({url: env.REDIS_URI});    
        this.handelConnection()
    }

    handelConnection(){
        this.client.on('error',(error:Error)=>{
            return console.log(`redis connection is fail ${error.message}`)
        })
        this.client.on('ready',()=>{
            console.log("redis is ready")
        })
    }
    connect(){
        this.client.connect();
        console.log("Connected to Redis");
    }

    createRevokeKey = ({userId,token}:{userId:Types.ObjectId,token:string}):string=>{
        return `revokeToken::${userId}::${token}`
    }

    set = async ({key,value,ttl}:{key:string,value:any,ttl?:number}): Promise<string | null>=>{
    if(typeof value === "object"){
        value = JSON.stringify(value); // convert object to string before storing in redis
    }
    return ttl? await this.client.set(key,value,{EX:ttl}) : await this.client.set(key,value);
    }   

    get =  async (key:string):Promise<string | null>=>{
        let data =  await this.client.get(key);
        if(!data){
            throw new NotFoundException("Key Not Found!")
        }
        try{
            data = JSON.parse(data) // convert string back to object if it was stored as an object
        }catch(error){ }
        return data
    }

    ttl = async (key:string):Promise<number>=>{
    return await this.client.ttl(key);
    }

    exists = async (key:string):Promise<number>=>{
    return await this.client.exists(key);
    }

    dele = async (key:string):Promise<number>=> {
    return await this.client.del(key);
    }

    mget =  async (...keys:string[]):Promise<(string | null)[]>=>{
    return await this.client.mGet(keys);
    }

    keys  = async (prefix:string):Promise<string[]>=>{
    return await this.client.keys(`${prefix}*`);
    }
}

export const redisService = new RedisService