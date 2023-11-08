import {collection,getDocs} from "firebase/firestore";
import { db } from "../config/firebaseConfig.js";
  
  export const getTasks = (req, res) => {
      getDocs(collection(db, "tasks")).then((response) => {
        const tasksArray = [];
        response.forEach((task) => {
          tasksArray.push({
            id: task.id,
            name: task.data().name+req.body.username,
            description: task.data().description,
            plannedTime: task.data().plannedTime,
            deadline: task.data().deadline,
            compleated: task.data().compleated,
            compleatedInTime: task.data().compleatedInTime,
          });
        });
        res.status(200).json(tasksArray)
      });
    };