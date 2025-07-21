import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendResetEmail } from '../utils/mailer.js';
import DB from "../db/db.js";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const admin = await DB.admin.findUnique({ where: { email } });

    if (!admin) {
        return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.admin.update({
        where: { id: admin.id },
        data: {
            reset_token: token,
            reset_token_expiry: expiry
        }
    });

    await sendResetEmail(email, token);

    res.json({ success: true, message: 'Password recovery email sent successfully. Please check your inbox' });
};


export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    const admin = await prisma.admin.findFirst({
        where: {
            reset_token: token,
            reset_token_expiry: {
                gte: new Date()
            }
        }
    });

    if (!admin) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.update({
        where: { email: admin.email },
        data: {
            password: hashedPassword,
            reset_token: null,
            reset_token_expiry: null
        }
    });

    res.json({ success: true, message: 'Password reset successful' });
};
