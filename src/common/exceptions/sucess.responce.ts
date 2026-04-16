import type{ Response } from "express"

export const SucessResponce = ({res,message="Success",status=200 ,data={}}: {res: Response, message: string, status: number, data: {}}) => {
    return res.status(status).json( {message,data})
}

export default SucessResponce