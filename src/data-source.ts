import "reflect-metadata"
import { DataSource } from "typeorm"
import { Photo } from "./entity/Photo"
import { User } from "./entity/User"
export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "sampledatabase",
    synchronize: true, 
    logging: false,
    entities: [User , Photo],
    migrations: [],
    subscribers: [],
})
