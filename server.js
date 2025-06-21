import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import dotenv from 'dotenv';
import DB from './src/db/db.js';
import rootRouter from './src/router/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'default-cookie-secret'));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default-session-secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 2, // 2 minutes
            httpOnly: true,
        },
        store: new PrismaSessionStore(DB, {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            sessionModelName: 'Session',
        }),
    })
);

app.use('/api/v1', rootRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on PORT: ${PORT}`);
});
