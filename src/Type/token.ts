import {Request} from "express";
export interface IUserRequest extends Request {
    userName: string
}