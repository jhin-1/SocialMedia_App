import z from "zod";

export const createPostSchema = {
    body:z.strictObject({
        content:z.string().optional(),
        tags: z.preprocess(
            (val) => {
                if (typeof val === "string") return [val]; // string → array
                return val;
            },
            z.array(z.string()).optional()
        ),
        visibility:z.string(),
        files: z.array(z.object()).optional()
    }).refine((values)=>{
        if(!values.content?.length && !values.files?.length) return false
        return true
    },{
        error:"please send content or attachments "
    })
}


export const getPostSchema = {
    params: z.object({
        id: z.string().min(1, {
            message: "Post id is required"
        })
    })
};