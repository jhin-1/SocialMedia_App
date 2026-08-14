import { DeleteObjectCommand, DeleteObjectCommandOutput, GetObjectCommand, GetObjectCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env.service";
import { randomUUID } from "crypto";
import { BadRequestEception } from "../exceptions/applecation.excptions";
import { MulterEnum } from "../enums/multer.enums";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { keyof } from "zod";

class S3Service {
    private client: S3Client;
    constructor(){
        this.client = new S3Client({
            region: env.AWS_REGION,
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    
    async uploadAsset({
        storageKey = MulterEnum.diskStorage,
        Bucket,
        path="General",
        file,
        ACL=ObjectCannedACL.private,
        ContentType
    }:
    {
        storageKey?: MulterEnum,
        Bucket?: string,
        path?: string,
        file:Express.Multer.File
        ACL?: ObjectCannedACL,
        ContentType?: string

    }){
        const command = new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key:`SocialMedia/${path}/${randomUUID()}__${file.originalname}`, // will store in DB 
            ACL,
            Body: storageKey == MulterEnum.memoryStorage ? file.buffer: createReadStream(file.path),
            ContentType:file.mimetype || ContentType
        });
        console.log(command,"From S3 Service")
        if(!command.input?.Key ){
            throw new BadRequestEception("Failed to Upload Asset")
        }
        await this.client.send(command)
        return command.input?.Key
    }
    
    async UploadBigAsset({ // for big file than 5mb
        Bucket=env.AWS_BUCKET_NAME,
        path="General",
        file,
        ACL=ObjectCannedACL.private,
        ContentType,
        partSize = 5
    }:
    {
        Bucket?: string,
        path?: string,
        file:Express.Multer.File
        ACL?: ObjectCannedACL,
        ContentType?: string
        partSize?:number
    }){
        const command =  new Upload({
            client:this.client,
            params:{
                Bucket,
                Key:`SocialMedia/${path}/${randomUUID()}__${file.originalname}`,
                ACL,
                Body: createReadStream(file.path),
                ContentType:file.mimetype || ContentType,
            },
            partSize: partSize * 1024 * 1024, 
            
            
        })
        console.log("From S3 Service Big Asset",command)
        command.on("httpUploadProgress", (progress) => {
            console.log(progress.loaded);
            console.log(`${progress.loaded as number / (progress.total as number) * 100}%`);
        });
        return await command.done()
    }
    

    async uploadAssets({
        storageKey = MulterEnum.diskStorage,
        Bucket,
        path="General",
        files,
        ACL=ObjectCannedACL.private,
        ContentType,
        originalname
    }:
    {
        storageKey?: MulterEnum,
        Bucket?: string,
        path?: string,
        files: Express.Multer.File[],
        ACL?: ObjectCannedACL,
        ContentType?: string,
        originalname?: string

    }):Promise <{result:string[]}>{
        
        const result = await Promise.all(files.map(item => {
            return this.uploadAsset({
                storageKey,
                Bucket:env.AWS_BUCKET_NAME,
                path,
                file: item,
                ACL,    
                ContentType: item.mimetype ,
            })
        })
    )
    return {result} 
    }

    async createPresignedUrl({
        Bucket=env.AWS_BUCKET_NAME,
        path="General",
        ContentType,
        originalname
    }:
    {
        Bucket?: string,
        path?: string,
        ContentType?: string
        originalname?: string
    }):Promise<{key:string,url:string}>{
        let key = `SocialMedia/${path}/${randomUUID()}__${originalname}`
        const command = new PutObjectCommand({
            Bucket,
            Key: key,
            ContentType: ContentType
        });
        const url = await getSignedUrl(this.client, command, { expiresIn: 60 * 2 }) // URL valid for 1 hour

        return {key, url}
    }
    
    async getAsset({Bucket=env.AWS_BUCKET_NAME,key}:{Bucket?: string, key: string,}):Promise<GetObjectCommandOutput>{
        const command = new GetObjectCommand({
            Bucket,
            Key: key,
        })
        return await this.client.send(command)
    }

    async deleteAsset({Bucket=env.AWS_BUCKET_NAME,key}:{Bucket?: string, key: string,}):Promise<DeleteObjectCommandOutput>{
        const command = new DeleteObjectCommand({
            Bucket,
            Key: key,
        })
        return await this.client.send(command)
    }

    async getPresignedUrl({Bucket=env.AWS_BUCKET_NAME,key,filename,donwload}:{Bucket?: string, key: string, filename?: string, donwload?: string}):Promise<string>{
        const command = new GetObjectCommand({
            Bucket,
            Key: key,
            ResponseContentDisposition:donwload == "true" ? `attachment; filename="${filename ||key.split("/").pop()}"` : undefined
        })
        const url = await getSignedUrl(this.client, command, { expiresIn: 60 * 2 })
        return url
    }
}

const s3Service = new S3Service();

export default s3Service;