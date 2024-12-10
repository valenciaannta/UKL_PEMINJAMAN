import { PrismaClient, Role } from "@prisma/client";
import md5 from "md5";

const prisma = new PrismaClient()


export const getAllUser = async(req,res) =>{
    console.log("cek masuk controller")
    try {
        const result = await prisma.user.findMany()
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: message.error
        })
        
    }
}
export const getUserById = async(req,res) =>{

    try {
        const result = await prisma.user.findUnique({
            where:{
                id_user:req.params.id
            }
        })
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: message.error
        })
        
    }
}
export const addUser = async(req,res) =>{

    try {
        const {nama, username, password, role} = req.body
        const ifusernameExist = await prisma.user.findFirst({
            where: {
                username
            }
        });
        if(ifusernameExist){
            res.status(201).json({
                status: false,
                message: "User is already exist"
            })
            return;
        }
        const result = await prisma.user.create({
            data:{
                nama_user: nama,
                username: username,
                password: md5(password),
                role: role
        
            }
        })
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: MessageChannel.error
        })
        
    }
}
export const updateUser = async(req,res) =>{

    try {
        const {nama, username, password,role} = req.body
        const result = await prisma.user.update({
            where:{
                id_user : req.params.id
            },
            data:{
                nama_user:nama,
                username:username,
                password:md5(password),
                role:role
        
            }
        })
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: MessageChannel.error
        })
        
    }
}
export const deleteUser = async(req,res) =>{

    try {
        const result = await prisma.user.delete({
            where:{
                id_user: req.params.id
            }
        })
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: MessageChannel.error
        })
        
    }
}