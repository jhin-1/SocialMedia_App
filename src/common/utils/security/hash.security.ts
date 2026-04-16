
import  {hash,compare} from 'bcrypt';
import { env } from "../../../config/env.service";


export const  hashText = async(planText:string):Promise<string>=>{
    return await hash(planText,Number(env.SALT));
}

export const compareText = async(planText:string,cypherText:string):Promise<boolean>=>{
    return  await compare(planText,cypherText);
}