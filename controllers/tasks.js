import { collection, getDocs, getDoc, doc, writeBatch, updateDoc, addDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig.js";

export const getTasks = (req, res) => {
  const user = req.user.username;
  getDocs(collection(db, "users", user, "tasks")).then((response) => {
    const tasksArray = [];
    response.forEach((task) => {
      const taskData = task.data();
      tasksArray.push({
        id: task.id,
        ...taskData,
      });
    });
    return res.status(200).json(tasksArray);
  });
};

export const getTask = async (req, res) => {
  const user = req.user.username;
  const id = req.query.id;
  if (id) {
    const docRef = doc(db, "users", user, "tasks", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const taskData = docSnap.data();
      const task = {
        name: taskData.name,
        description: taskData.description,
        plannedTime: taskData.plannedTime,
        deadline: taskData.deadline,
        conditions: taskData.conditions,
        value: taskData.value,
      };
      return res.status(200).json(task);
    } else {
      return res.status(404).json(null);
    }
  } else {
    return res.status(400).json(null);
  }
};

export const dailyReset = async (req, res) => {
  const user = req.user.username;
  try {
    const docRef = doc(db, "users", user, "common", "date");
    const snapshot = await getDoc(docRef);
    const data = snapshot.data();
    const dbDate = data?.date;
    const currentDate = new Date();
    const isNewDay = !dbDate || dbDate.toDate().getDate() !== currentDate.getDate();

    if (isNewDay) {
      await resetTasksFunction(user);
      await setDoc(docRef, { date: currentDate });
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(false);
  }
};
export const resetTasks = async (req, res) => {
  const user = req.user.username;

  try {
    resetTasksFunction(user);
    return res.status(200).json("Úkoly byly resetovány");
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
};
export const resetTasksFunction = async (user) => {
  const batch = writeBatch(db);
  const response = await getDocs(collection(db, "users", user, "tasks"));

  response.forEach((task) => {
    const taskData = task.data();
    if (taskData.compleated || taskData.compleatedInTime) {
      batch.update(doc(db, "users", user, "tasks", task.id), {
        compleated: false,
        compleatedInTime: false,
      });
    }
  });
  await batch.commit();
};

export const storeTask = async (req, res) => {
  const user = req.user.username;
  const taskData = req.body.taskData;
  try {
    await addDoc(collection(db, "users", user, "tasks"), taskData);
    return res.status(200).json("Úkol byl vytvořen");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.code || "Došlo k chybě");
  }
};

export const updateTask = async (req, res) => {
  const user = req.user.username;
  const taskData = req.body.taskData;
  const id = req.body.id;

  if (!id) return res.status(400).json("Úkol nebyl nalezen");
  try {
    await updateDoc(doc(db, "users", user, "tasks", id), taskData);
    return res.status(200).json("Úkol byl aktualizován");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.code || "Došlo k chybě");
  }
};

export const deleteTask = async (req, res) => {
  const user = req.user.username;
  const id = req.query.id;
  if (!id) return res.status(400).json("Úkol nebyl nalezen");
  try {
    await deleteDoc(doc(db, "users", user, "tasks", id));
    return res.status(200).json("Úkol byl úspěšně smazán");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.code || "Došlo k chybě");
  }
};

export const toggleTaskStatus = async (req, res) => {
  const user = req.user.username;
  const id = req.body.id;
  const conditions = req.body.conditions;
  if (!id) return res.sendStatus(400);
  const currenTime = new Date().getHours() + new Date().getMinutes() / 60;

  const response = await getDoc(doc(db, "users", user, "tasks", id));
  const taskData = response.data();
  const compleatedInTime = currenTime <= (taskData.deadline === 0 ? Infinity : taskData.deadline);
  const compleated = !taskData.compleated;
  try {
    await updateDoc(doc(db, "users", user, "tasks", id), {
      compleated,
      compleatedInTime,
    });
    if (conditions) {
      await updateDoc(doc(db, "users", user, "tasks", id), { conditions });
    }
    return res.status(200).json({
      compleated,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

export const updateNote = async (req, res) => {
  const user = req.user.username;
  const id = req.body.id;

  const description = req.body.description;
  if (!id) return res.sendStatus(200);
  try {
    await updateDoc(doc(db, "users", user, "tasks", id), {
      description,
    });
    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
