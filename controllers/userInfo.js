export const getUser = (req, res)=>{
    res.status(200).json(req.user.username)
}