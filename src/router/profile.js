import { Router } from "express";
import { matchedData, param, validationResult } from "express-validator";
import { commonParamValidate, commonQueryValidate, commonValidate } from "../utils/validatorMethod.js";
import { commonError } from "../utils/error-creator.js";
import DB from "../db/db.js";

const profileRouter = Router();

// GET all profiles
profileRouter.get('/all', async (_, res) => {
    try {
        const allProfiles = await DB.profile.findMany({
            include: {
                AccountDetails: {
                    select: {
                        Id: true,
                        Name: true,
                        Username: true
                    }
                }
            },
        });
        return res.status(200).json({
            message: "All profiles",
            data: allProfiles
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
});

// GET profile by ID
profileRouter.get('/:id', param('id').notEmpty().isNumeric().withMessage("Invalid ID"),
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = commonError(error.array());
            return res.status(400).json({
                message: "Validation error",
                error: err,
                data: null
            });
        }

        const data = matchedData(req);

        try {
            const profile = await DB.profile.findUnique({
                include: {
                    AccountDetails: {
                        select: {
                            Id: true,
                            Name: true,
                            Username: true
                        }
                    }
                },
                where: {
                    Id: Number(data.id)
                }
            });

            return res.status(200).json({
                message: "Profile data",
                data: profile
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal server error",
                error: error.message,
                data: null
            });
        }
    }
);

// POST create a new profile
profileRouter.post('/create', commonQueryValidate('userId'), commonQueryValidate('Image'), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);
    try {
        const user = await DB.user.findUnique({
            where: { Id: Number(data.userId) }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: "Invalid userId",
                data: null
            });
        }

        const newProfile = await DB.profile.create({
            data: {
                UserId: Number(data.userId),
                Image: data.Image
            }
        });

        return res.status(201).json({
            message: "Profile created",
            data: newProfile
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
});

// PUT update a profile by ID
profileRouter.put('/update/:id', commonParamValidate('id'), commonValidate("image"), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);
    try {
        const updatedProfile = await DB.profile.update({
            data: {
                Image: data.image
            },
            where: {
                Id: Number(data.id)
            }
        });

        return res.status(200).json({
            message: "Profile updated",
            data: updatedProfile
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
}
);

// DELETE profile by ID
profileRouter.delete('/delete/:id', commonParamValidate('id'), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);

    try {
        await DB.profile.delete({
            where: {
                Id: Number(data.id)
            }
        });

        return res.status(200).json({
            message: "Profile deleted"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
}
);

export default profileRouter;