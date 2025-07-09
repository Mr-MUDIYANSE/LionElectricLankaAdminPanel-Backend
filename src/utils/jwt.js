import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET||"Qxv83#1F@jU!zWp7Ldk92&vM";

export const tokenGenerate = (payload) => {
    const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
    return token;
};

export const decodeToken = (token) => {
    const payload = jwt.decode(token);
    return payload;
}

export const verifyToken = (token) => {
    try {
        const payload = jwt.verify(token, secretKey);
        return payload;
    } catch (error) {
        console.log(error);
        return null;
    }
}