import express from 'express';
import dotenv from 'dotenv';
import rootRouter from "./src/router/root/root.router.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json());
app.use('/api/v1', rootRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on PORT: ${PORT}`);
});