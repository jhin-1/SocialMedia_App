import z from "zod";
import { loginSchema, signupSchema, verfiyEmailSchema } from "./auth.validtion";

// DTO: Data Transfer Object


// export interface LoginDto {
//     email: string
//     password: string
// }

// export interface SignupDto extends LoginDto {
//     name: string
//     confirmPassword: string
// }

export type LoginDto = z.infer<typeof loginSchema.body> // this will infer the type of the body of the loginSchema, so we don't have to manually define the LoginDto, and it will be automatically updated if we change the loginSchema

export type SignupDto  = z.infer<typeof signupSchema.body> // this will infer the type of the body of the signupSchema, so we don't have to manually define the SignupDto, and it will be automatically updated if we change the signupSchema

export type verfiyEmailDto = z.infer<typeof verfiyEmailSchema.body>