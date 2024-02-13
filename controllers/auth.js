import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "../config/firebaseConfig.js"

dotenv.config()





export const register = async (req, res)=>{
    const username = req.body.username
    const password = req.body.password
    try{
        const docRef = doc(db, "users", username)
        const response = await getDoc(docRef)
        if(response.exists()){
            return res.status(409).json("User olready exists!")
        }
        if(password.length>20 || password.length<8){
            return res.status(400).json("Invalid password length. Please use a password between 8 and 20 characters.")
        }
        if(username.length>20 || username<4){
            return res.status(400).json("Invalid username length. Please use a username between 4 and 20 characters.")
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt)
    
    
        await setDoc(doc(db, "users", username), {
            password:hash
        })
        return res.status(200).json("User has been created")
    }
    catch(error){
        console.log(error)
        return res.status(500).json("Internal Server Error")
    }
}

export const login = async(req, res)=>{
    const username = req.body.username
    const password = req.body.password
    try{
        const docRef = doc(db, "users", username)
        const response = await getDoc(docRef)

        if(!response.exists) return res.status(400).json("User do not exist")
        const passwordHash = response.data().password
        if(!password || !bcrypt.compareSync(password, passwordHash)) return res.status(400).json("Wrong username or password")
        
        const user = {username}
    
        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        await setDoc(doc(db, "users", username, "common", "refreshToken"),{refreshToken})
        res.cookie("access_token", accessToken, {httpOnly:true})
        res.cookie("refresh_token", refreshToken, {httpOnly:true})
        return res.sendStatus(200)
    }
    catch(err){
        console.log(err)
        return res.status(500).json("Došlo k neočekávané chybě. "+err)
    }
}

export const logout = async (req, res)=>{
    const refreshToken = req.cookies.refresh_token
    try{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user)=>{
            if(err) return res.sendStatus(403)

            await deleteDoc(doc(db, "users", user.username, "common", "refreshToken"))
            res.clearCookie("access_token", {
                sameSite:"none",
                secure:true
            })
            res.clearCookie("refresh_token", {
                sameSite:"none",
                secure:true
            })
            return res.status(200).json("User has been logged out")
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json("Došlo k chybě. "+ err)
    }
    
}




export const verifyRefreshToken = async (req, res)=>{
    const refreshToken = req.cookies.refresh_token
    if(!refreshToken) return res.sendStatus(401)
    try{
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user)=>{
    if(err) return res.sendStatus(403)
    const docSnap = await getDoc(doc(db, "users", user.username, "common", "refreshToken"))
    if(!docSnap.exists()) return res.sendStatus(403)
    if(docSnap.data().refreshToken!==refreshToken) return res.sendStatus(403)

    const accessToken = generateAccessToken({username:user.username})
    return res.cookie("access_token", accessToken, {httpOnly:true}).sendStatus(200)
    })
    }catch(err){
        console.log(err)
        return res.sendStatus(500)
    }
}

export const authenticateToken = (req, res, next)=>{
    const accessToken = req.cookies.access_token
    const refreshToken = req.cookies.refresh_token
    if(!accessToken) return res.sendStatus(401)

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if (err) {
            if(refreshToken){
                refreshAccessToken(refreshToken, res, (data)=>{
                    if(data.status){
                        return res.sendStatus(data.status)
                    }
                    req.user = data
                    next()
                })
                
                
            }else{
                return res.sendStatus(403)
            }
            
        }
        else{
            req.user = user
            next()
        }
    })
}
const refreshAccessToken = async (refreshToken, res, callback)=>{
    const data = {
        status: undefined,
        username: undefined
    }
    if(!refreshToken) {data.status = 401; return callback(data)}

    try{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, user)=>{
            if(err) {data.status = 403; return data}
            
            const docSnap = await getDoc(doc(db, "users", user.username, "common", "refreshToken"))
            if(!docSnap.exists()) {data.status = 403; return callback(data)}
            if(docSnap.data().refreshToken!==refreshToken) {data.status = 403; return callback(data)}
        
            const accessToken = generateAccessToken({username:user.username})
            res.cookie("access_token", accessToken, {httpOnly:true})
            data.username = user.username;
            return callback(data)
        })
    }catch(err){
        console.log(err)
        data.status = 500
        return callback(data)
    }
}



const generateAccessToken = (user)=>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10s"})
}