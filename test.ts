import { fail } from "assert";
import * as express from "express"
import { Request , Response } from "express";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
const app = express();
app.use(express.json());
const PORT = 3000;
app.get("/login" , async (req : Request , res : Response) => {
    AppDataSource.initialize().then(async() => {
        const userData = await AppDataSource.getRepository(User);
        const users = await userData.find();
        res.json(users)
    }).catch((err) => {
        console.log(err);
    })
})
app.post("/login" , async (req : Request , res : Response) => {
    AppDataSource.initialize().then(async() => {
        const {email , password} = req.body
        if(! (email && password)){
            res.status(400).send();
        }
    const userData = await AppDataSource.getRepository(User);;
    const user = await userData.findOneOrFail({where : {email}});
    if(user.password == password){
        res.json({email,password})
    }
    else {
        res.status(400).send();
    }
    }).catch((err) => {
        console.log(err);
    })
})
app.listen(PORT , () => {
    console.log(`server is running on ${PORT} `)
});
