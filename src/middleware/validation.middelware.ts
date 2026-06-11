import type { NextFunction, Request,Response } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequestEception } from "../common/exceptions/applecation.excptions";

type ValidationKey = keyof Request // if is body, query, params, headers, cookies, etc.
type ValidationSchema = Partial<Record<ValidationKey,ZodType>> // Partial because we may not want to validate all of them, Record because we want to map the keys to the ZodType

export const ValidationSchema = (schema: ValidationSchema) => {
    return ((req: Request, res: Response, next: NextFunction) => {
        let validationErrors: {key: ValidationKey, issue: ZodError["issues"]}[] = []
        if(req.files) req.body.files = req.files as Express.Multer.File[]
        if(req.file) req.body.file = req.file as Express.Multer.File
        for(const key of Object.keys(schema) as ValidationKey[]){
            if(!schema[key]){
                continue
            }
            const value = schema[key].safeParse(req[key])
            if(!value.success){
                validationErrors.push({key, issue:value.error.issues})
            }
        }
        if(validationErrors.length>0){
            throw new BadRequestEception("Validation error", validationErrors) 
        }
        next()
    })
}