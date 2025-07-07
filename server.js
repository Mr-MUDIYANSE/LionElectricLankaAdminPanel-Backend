import express from 'express';
import dotenv from 'dotenv';
import rootRouter from "./src/router/root/root.router.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/v1', rootRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on PORT: ${PORT}`);
});
