import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./router/route.js";

dotenv.config();

const PORT = process.env.PORT;
const databaseUri = process.env.DATABASE;

const app = express();
app.use(express.json({extended: true})); 
app.use(express.urlencoded({extended: true}));

app.use('/api', router);

mongoose
    .connect(databaseUri, { 
        
    })
    .then(() => console.log("Connected to the database"))
    .catch(err => console.error("Failed to connect to the database:", err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});