import { config } from "dotenv";
import path from "path";

config({path:path.resolve(`./.env.${process.env.NODE_ENV}`)})

export const env = {
    PORT : process.env.PORT,
    MONGO_URI : process.env.MONGO_URI as string,
    MOOD : process.env.MOOD as string,
    SALT : process.env.SALT as string,
    JWT_KEY: process.env.JWT_KEY as string,
    USER_SIGNATURE: process.env.JWT_USER_SIGNATURE as string,
    ADMIN_SIGNATURE: process.env.JWT_ADMIN_SIGNATURE as string,
    ADMIIN_REFRESH_TOKEN: process.env.JWT_ADMIN_REFRESH_SIGNATURE as string,
    USER_REFRESH_TOKEN: process.env.JWT_USER_REFRESH_SIGNATURE as string,
    EMAIL_USER: process.env.EMAIL_USER as string,
    EMAIL_PASS: process.env.EMAIL_PASS as string,
    BASE_URL: process.env.BASE_URL as string,
    REDIS_URI: process.env.REDIS_URL as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string
}
