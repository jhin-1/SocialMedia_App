import z from "zod";

export const signupSchema = {
    body: z.strictObject({ // strictObject ensures that no additional fields are allowed
        userName: z.string({error: "Username is required"}).min(5,{error: "Username must be at least 5 characters"}).max(30,{error: "Username must be at most 30 characters"}),
        email: z.email({message:"Invalid email address"}),
        phone: z.string({error: "Phone number is required"}).min(11,{error: "Phone number must be at least 12 characters"}).max(12,{error: "Phone number must be at most 12 characters"}),
        image:z.url({message:"Invalid image url"}).optional(),
        password: z.string({error: "Password is required"}).min(9,{error: "Password must be at least 9 characters"}).max(12,{error: "Password must be at most 12 characters"}),
        confirmPassword: z.string({error: "Confirm password is required"}).min(9,{error: "Confirm password must be at least 9 characters"}).max(12,{error: "Confirm password must be at most 12 characters"})
    }).refine((data) => data.password === data.confirmPassword, { //  we have another funcation superrefine  for more complex validation, but here we can use refine
        message: "Passwords don't match",
        path: ["confirmPassword"] // this will point to the confirmPassword field in the error message
    })
}

export const loginSchema = {
    body:z.strictObject({
        email:z.email({message:"Invalid email address"}),
        password:z.string({error: "Password is required"}).min(9,{error: "Password must be at least 9 characters"}).max(12,{error: "Password must be at most 12 characters"})
    })
}

export const verfiyEmailSchema = {
    body:z.strictObject({
        email:z.email({message:"Invalid email address"}),
        code:z.string({message:"invalid otp"})
    })
}