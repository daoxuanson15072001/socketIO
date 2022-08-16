import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken"
import {IUserRequest} from "../Type/token"
export const authMiddleware = async (req : IUserRequest, res : Response , next : NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    // console.log(token)
    if(token){
        jwt.verify(token , process.env.TOKEN_KEY , (err , data) => {
            if(err){
                return res.status(400).send("token invalid")
            }
            else {
                req.userName = data["email"];
                next()
            }
        })
    }
    else {
        return res.status(401).send("unauthorized");
    }
}