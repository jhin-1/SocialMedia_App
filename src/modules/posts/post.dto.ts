import z from "zod";
import { createPostSchema, getPostSchema } from "./post.validtion";

export type createDto  = z.infer<typeof createPostSchema.body> // this will infer the type of the body of the createPostSchema, so we don't have to manually define the createDto, and it will be automatically updated if we change the createPostSchema

export type getDto = z.infer<typeof getPostSchema.params>