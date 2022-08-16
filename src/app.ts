import { fail } from "assert";
import * as express from "express"
import { Request , Response } from "express";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { authMiddleware } from "./middlewares/authMiddleware";
import {IUserRequest} from "./Type/token"
import * as dotenv from 'dotenv'
import * as jwt from "jsonwebtoken"
import * as bcrypt from "bcryptjs"
import * as EmailValidator from 'email-validator';
import { compare } from "bcrypt";
AppDataSource.initialize().then(() => {
    dotenv.config();
    const app = express();
    app.use(express.json());
    const PORT = process.env.PORT || 5000
    let listRefreshToken : string[] = [];
    // lay du lieu tat ca nguoi dung
    app.get("/user" , async(req : Request , res: Response) => {
        const userData = await AppDataSource.getRepository(User);;
        const users = await userData.find();
        res.json(users);
    });
    // dang nhap
    app.post("/login" , async(req : Request , res : Response) => {
        const {email , password} = req.body
        if(! (email && password)){
           return  res.status(400).send("All input is required");
        }
        if(!EmailValidator.validate(email)){
           return  res.status(400).send("Please provide a valid email address.")
        }
        const userData = await AppDataSource.getRepository(User);
        const user = await userData.findOne({where : {email}})
        if(user && (await bcrypt.compare(password , user.password))){
            const token = await jwt.sign({email} , process.env.TOKEN_KEY , {expiresIn : "30s"})
            const refreshToken = await jwt.sign({email} , process.env.REFRESHTOKEN_KEY , {expiresIn : "2h"})
            listRefreshToken.push(refreshToken);
            res.json({email , token , refreshToken});
        }
        else {
            res.status(400).send("email or password is not correct");
        }
    })
    
    //dang ki
    app.post("/register" , async(req : Request , res : Response) => {
        try {
            const userData =   await AppDataSource.getRepository(User);
            const {firstName , lastName , email , password , age} = req.body
            if (!(email && password && firstName && lastName && age)) {
               return  res.status(400).send("All input is required");
            }
            if(EmailValidator.validate(email) && !(await userData.findOne({where : {email}}))){
                const encryptedPassword = await bcrypt.hash(password, 10);
                const user = new User()
                user.age = age
                user.firstName = firstName
                user.lastName = lastName
                user.email = email.toLowerCase()
                user.password = encryptedPassword
                AppDataSource.manager.save(user);
                const token = await jwt.sign({email} , process.env.TOKEN_KEY , {expiresIn : "30s"})
                res.json({email , token});
            }
            res.status(400).send("Please provide a valid email address.")
        } catch (error) {
            console.log(error);
        }
    })
    // refresh token
    app.post("/token" , (req : Request , res : Response)=> {
        const refreshToken = req.body.refreshToken
        if(!refreshToken) return res.sendStatus(401);
        if(!listRefreshToken.includes(refreshToken)) return res.send("false");
        jwt.verify(refreshToken , process.env.REFRESHTOKEN_KEY , async (err : any , data : any)=> {
            if(err) {
                return res.sendStatus(403)
            }
            const token = await jwt.sign({email: data.email} , process.env.TOKEN_KEY , {
                expiresIn : "30s"
            })
            res.json(token);
        })
    })

    // doi mat khau
    app.post("/changePassoWord" , async(req : Request , res : Response) => {
        const userData = await AppDataSource.getRepository(User);
        const {oldPassword , newPassword , email} = req.body;
        const user = await userData.findOne({where : {email}})
        console.log(user)
        if(await bcrypt.compare(oldPassword , user.password)){
            const encryptedPassword = await bcrypt.hash(newPassword, 10);
            await userData.update({email : email} , {password : encryptedPassword})
            res.status(200).json("updated succes")
        }
        else {
            res.sendStatus(404);
        }
    }) 

    //lay thong tin nguoi dung da dang nhap
    app.get("/profile", authMiddleware ,async (req :IUserRequest , res : Response) => {
        const userData = await AppDataSource.getRepository(User);;
        const user = await userData.find({
            select : {
                firstName : true,
                lastName : true,
                email : true,
                age : true
            },
            where : {
                email : req.userName
            }
        });
        res.json(user)
    })

    //update profile
    app.put("/profile/update/:id", authMiddleware ,async (req :IUserRequest , res : Response) => {
        const userData = await AppDataSource.getRepository(User);
        const {firstName , lastName , age} = req.body
        await userData.update({id : parseInt(req.params.id)} , {
            firstName : firstName ,
            lastName : lastName ,
            age : age
        })
    })

    app.listen(PORT , ()=>{
        console.log(`server is running on ${PORT}`);
    })
}).catch((err) => {
    console.log(err);
});


