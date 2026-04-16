import multer from "multer";
import fs from 'fs';


export let multer_local = ({customPath}={customPath:"general"})=>{
    let storage = multer.diskStorage({
        destination:function(req,file,cb){
            let path = `upload/${customPath}`

            if(!fs.existsSync(path)){
                fs.mkdirSync(path,{recursive:true}) // recursive:true to create all the folders in the path if they don't exist
            }
            cb(null, path)

        }
        ,
        filename:function(req,file,cb){
            let perfix = Date.now()
            let name = perfix +"-"+file.originalname
            cb(null,name)
        }
    })
    return multer({storage})
}