import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()


let refreshTokens = []

const users = [
    {
        username:"Jenda",
        password: bcrypt.hashSync("ahojdajaJsemJirka", bcrypt.genSaltSync(10))
    },
    {
        username:"Sonda",
        password: bcrypt.hashSync("nechcitoresit", bcrypt.genSaltSync(10))
    },
    {
        username:"hlupak",
        password: bcrypt.hashSync("123456", bcrypt.genSaltSync(10))
    }
]

export const register = (req, res)=>{
    try{

        if(users.some((user)=>user.username===req.body.username)){
            return res.status(409).json("User olready exists!")
        }

        if(req.body.password.length>20 || req.body.password.length<8){
            return res.status(400).json("Invalid password length. Please use a password between 8 and 20 characters.")
        }
        if(req.body.username.length>20 || req.body.username<4){
            return res.status(400).json("Invalid username length. Please use a username between 4 and 20 characters.")
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt)
    
        users.push({
            username:req.body.username,
            password:hash
        })
        return res.status(200).json("User has been created")
    }
    catch(error){
        return res.status(500).json("Internal Server Error")
    }
}

export const login = (req, res)=>{
    const user = users.find(({username})=>username===req.body.username)
    if(!user) return res.status(400).json("User do not exist")
    if(!req.body.password || !bcrypt.compareSync(req.body.password, user.password)) return res.status(400).json("Wrong username or password")
    
    const userName = {username: user.username}

    const accessToken = generateAccessToken(userName)
    const refreshToken = jwt.sign(userName, process.env.REFRESH_TOKEN_SECRET)
    // uživatel se může přihlásit vícekrát tokeny se nemažou
    refreshTokens.push(refreshToken)
    res.cookie("access_token", accessToken, {httpOnly:true})
    res.cookie("refresh_token", refreshToken, {httpOnly:true})
    res.sendStatus(200)

}

export const logout = (req, res)=>{
    const refreshToken = req.cookies.refresh_token

    refreshTokens = refreshTokens.filter(token=>token !== refreshToken)
    res.clearCookie("access_token", {
        sameSite:"none",
        secure:true
    })
    res.clearCookie("refresh_token", {
        sameSite:"none",
        secure:true
    })
    
    res.status(200).json("User has been logged out")
}




export const verifyRefreshToken = (req, res)=>{
    const refreshToken = req.cookies.refresh_token
    if(!refreshToken) return res.sendStatus(401)
    
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
    if(err) return res.sendStatus(403)
    const accessToken = generateAccessToken({username:user.username})
    res.cookie("access_token", accessToken, {httpOnly:true}).sendStatus(200)
    })
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
    if(!refreshTokens.includes(refreshToken)) {data.status = 403; return callback(data)}
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err) {data.status = 403; return data}
        const accessToken = generateAccessToken({username:user.username})
        res.cookie("access_token", accessToken, {httpOnly:true})
        data.username = user.username;
        return callback(data)
    })
}



const generateAccessToken = (user)=>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10s"})
}