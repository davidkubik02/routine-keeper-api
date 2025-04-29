import { collection, getDocs, getDoc, doc, writeBatch, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig.js";
import { resetTasksFunction } from "./tasks.js";

export const evaluateTasks = async (req, res) => {
  try {
    const user = req.user.username;
    const taskResponse = await getDocs(collection(db, "users", user, "tasks"));

    const tasks = [];
    taskResponse.forEach((task) => {
      tasks.push(task.data());
    });
    const tolerance = 0.69;
    const avilable = rewardIsAvailable(tasks, tolerance);
    return res.status(200).json({ avilable });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const collectReward = async (req, res) => {
  const user = req.user.username;
  const id = req.query.id;

  try {
    await deleteDoc(doc(db, "users", user, "rewards", id));
    return res.status(200).json("Odměna byla vyzvednuta");
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
export const addReward = async (req, res) => {
  const user = req.user.username;
  const description = req.body.description;
  try {
    await addDoc(collection(db, "users", user, "rewards"), { description });

    resetTasksFunction(user);
    return res.status(200).json('Odměna byla přidána, lze vyzvednout v sekci "Odměny"');
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

export const getRewards = async (req, res) => {
  const user = req.user.username;

  try {
    const response = await getDocs(collection(db, "users", user, "rewards"));
    const rewards = [];
    response.forEach((reward) => rewards.push({ ...reward.data(), id: reward.id }));
    return res.status(200).json(rewards);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

const rewardIsAvailable = (tasks, tolerance) => {
  const totalValue = tasks.reduce((sum, task) => sum + task.value, 0) * 2 * tolerance;
  const obtainedValue = tasks.reduce((sum, task) => {
    if (task.compleated) {
      if (!task.compleatedInTime) {
        return sum + task.value;
      }
      const conditionSum = task.conditions.reduce((count, condition) => {
        return (
          count +
          (condition.controled ? (condition.range - condition.minimum) / (condition.maximum - condition.minimum) : 1)
        );
      }, 0);

      return sum + (task.conditions.length === 0 ? 1 : conditionSum / task.conditions.length) * task.value + task.value;
    }
    return sum;
  }, 0);
  if (totalValue <= obtainedValue) {
    return true;
  } else return false;
};
