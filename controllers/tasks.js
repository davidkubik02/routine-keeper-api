const taskData = [
    {
    name:"Jenda",
    tasks:[
        {
            name:"nazevukolu",
            time:545646
        },
        {
            name:"nazevukfdafdolu",
            time:56456
        },
        {
            name:"nazevgfaadsukolu",
            time:66666
        }
    ]
    },
    {
    name:"Pavel",
    tasks:[
        {
            name:"nazevukolu",
            time:545646
        },
        {
            name:"nazevukfdafdolu",
            time:56456
        },
        {
            name:"nazevgfaadsukolu",
            time:66666
        }
    ]
    },
    {
    name:"Zmrd",
    tasks:[
        {
            name:"nazevukolu",
            time:545646
        },
        {
            name:"nazevukfdafdolu",
            time:56456
        },
        {
            name:"nazevgfaadsukolu",
            time:66666
        }
    ]
    }
]



export const getTasks = (req, res)=>{
    const tasks = taskData.find(data=>data.name===req.user.name)
    if (!tasks) return res.status(200).json([])
    res.status(200).json(tasks.tasks)
}