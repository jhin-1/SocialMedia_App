import multer from 'multer';
import {tmpdir} from 'os';
import { MulterEnum } from '../../enums/multer.enums';

export const uploadFile = ({storageKey = MulterEnum.memoryStorage}:{storageKey?: MulterEnum})=>{


    const storage: multer.StorageEngine = storageKey == MulterEnum.memoryStorage ?multer.memoryStorage():multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null, tmpdir())
    },

    filename: function (req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+"-"+file.originalname
        callback(null, `${file.fieldname}-${uniqueSuffix}`)
    }
    })

    return multer({storage})
}