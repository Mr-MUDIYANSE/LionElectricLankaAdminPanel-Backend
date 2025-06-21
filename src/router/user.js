import { Router } from 'express';
import DB from '../db/db.js';
import { matchedData, validationResult } from 'express-validator';
import { commonError } from '../utils/error-creator.js';
import { commonValidate, registerValidate } from '../utils/validatorMethod.js';
import { tokenGenerate } from '../utils/jwt.js';
import { checkAuth } from '../utils/authMiddleware.js';

const userRouter = Router();

// GET all users
userRouter.get('/all-users', async (_, res) => {
    try {
        const allUsers = await DB.user.findMany();
        const userData = allUsers.map(({ Password, ...rest }) => rest);

        return res.status(200).json({
            message: "All user data",
            data: userData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
});

// GET single user by Id
userRouter.get('/:Id', async (req, res) => {
    const { Id } = req.params;
    if (Id !== undefined && Id !== "") {
        try {
            const userData = await DB.user.findUnique({
                where: { Id: Number(Id) }
            });

            if (userData !== null) {
                const { Password, ...safeData } = userData;
                return res.status(200).json({
                    message: "User data",
                    data: safeData,
                });
            }

            return res.status(404).json({
                message: "User not found",
                data: null,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal server error",
                data: null
            });
        }
    }
    return res.status(400).json({
        message: "InvalId user Id",
        data: null,
    });
});

//GET profile by user id
userRouter.get('/profile/:Id', async (req, res) => {
    const { Id } = req.params;
    if (Id !== undefined && Id !== "") {
        try {
            const userData = await DB.user.findUnique({
                select: {
                    Profile: {
                        select: {
                            Image: true
                        }
                    }
                },
                where: { Id: Number(Id) }
            });

            if (userData !== null) {
                const { Password, ...safeData } = userData;
                return res.status(200).json({
                    message: "User data",
                    data: safeData,
                });
            }

            return res.status(404).json({
                message: "User not found",
                data: null,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal server error",
                data: null
            });
        }
    }
    return res.status(400).json({
        message: "InvalId user Id",
        data: null,
    });
});

//GET product by user id
userRouter.get('/product/:Id', async (req, res) => {
    const { Id } = req.params;
    if (Id !== undefined && Id !== "") {
        try {
            const userData = await DB.user.findUnique({
                select: {
                    Products: {
                        select: {
                            Id: true,
                            Name: true,
                            ProductCategory: {
                                select: {
                                    Id: true,
                                    Name: true
                                }
                            }
                        }
                    }
                },
                where: { Id: Number(Id) }
            });

            if (userData !== null) {
                const { Password, ...safeData } = userData;
                return res.status(200).json({
                    message: "User data",
                    data: safeData,
                });
            }

            return res.status(404).json({
                message: "User not found",
                data: null,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal server error",
                data: null
            });
        }
    }
    return res.status(400).json({
        message: "InvalId user Id",
        data: null,
    });
});

// POST create new user
userRouter.post('/create', async (req, res) => {
    try {
        const existingUser = await DB.user.findUnique({
            where: { Username: req.body.Username },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const newUser = await DB.user.create({
            data: {
                Name: req.body.Name,
                Username: req.body.Username,
                Password: req.body.Password,
            },
        });

        const { Password, ...safeUser } = newUser;

        return res.status(201).json({
            message: "User created",
            data: safeUser,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
});

// PUT update user by Id
userRouter.put('/update/:Id', async (req, res) => {
    const { Id } = req.params;
    if (Id !== undefined && Id !== "") {
        // Remove Password field if it exists in the update body
        const { Password, password, ...updateData } = req.body;

        if (Password || password) {
            return res.status(400).json({
                message: "Password update not allowed through this endpoint",
                data: null
            });
        }

        try {
            const updatedUserData = await DB.user.update({
                where: { Id: Number(Id) },
                data: updateData
            });

            const { Password, ...safeData } = updatedUserData;

            return res.status(200).json({
                message: "User data updated",
                data: safeData,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal server error",
                data: null
            });
        }
    }
    return res.status(400).json({
        message: "InvalId user Id",
        data: null,
    });
});

// DELETE delete user by Id
userRouter.delete('/delete/:Id', async (req, res) => {
    const { Id } = req.params;
    if (Id !== undefined && Id !== "") {
        try {
            await DB.user.delete({
                where: { Id: Number(Id) }
            });
            return res.status(200).json({
                message: "User deleted",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal server error",
                data: null
            });
        }
    }
    return res.status(400).json({
        message: "InvalId user Id",
        data: null,
    });
});

//User Login
userRouter.post('/login', commonValidate('Username', "Password"), async (req, res) => {
    const error = validationResult(req);
    const lErr = commonError(error.array());

    if (error.array().length) {
        return res.status(500).json({
            message: "error",
            error: lErr,
            data: null
        });
    }

    const data = matchedData(req);
    try {
        const user = await DB.user.findUnique({
            where: {
                Username: data.Username
            }
        });

        if (user !== null) {
            if (user.Password === data.Password) {

                //token generate
                const payload = {
                    username: user.Username
                }
                const token = tokenGenerate(payload);

                const { Password, ...safeUser } = user;
                return res.status(200).json({
                    message: "Login success",
                    token: token,
                    data: safeUser
                });
            }

            return res.status(400).json({
                message: "error",
                error: 'Incorrect password',
                data: null
            });
        }

        return res.status(404).json({
            message: "error",
            error: 'username not found',
            data: null
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "error",
            error: 'error',
            data: null
        });
    }
});

// User register
userRouter.post('/register', registerValidate, async (req, res) => {
    const error = validationResult(req);
    const rErr = commonError(error.array());

    if (error.array().length) {
        return res.status(500).json({
            message: "error",
            error: rErr,
            data: null
        });
    }

    const data = matchedData(req);
    try {
        const newUser = await DB.user.create({ data });
        const { Password, ...safeUser } = newUser;
        return res.status(200).json({
            message: "user registered",
            data: safeUser
        });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            return res.status(500).json({
                message: "Internal server error",
                error: "user already exist",
                data: null
            });
        }
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
});

//Token validation check
userRouter.post('/validate-token', checkAuth, (req, res) => {
    return res.status(200).json({
        message: "Token verified",
        error: null,
        data: null
    });
});

export default userRouter;