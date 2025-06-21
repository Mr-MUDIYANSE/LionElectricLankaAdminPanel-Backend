import { body, param, query } from "express-validator";

export const registerValidate = [
    body('Username')
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Username must be required"),

    body('Password')
        .trim()
        .notEmpty()
        .withMessage("Password must be required")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."),

    body('Name')
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Name must be required"),
];

export const commonValidate = (...keys) => {
    const loginVa = [];
    keys.forEach(k => {
        loginVa.push(body(k).notEmpty().withMessage(`${k} is required`));
    })

    return loginVa;
}

export const commonQueryValidate = (...keys) => {
    const validateQuery = [];
    keys.forEach(k => {
        validateQuery.push(query(k).notEmpty().withMessage(`${k} is required`));
    })

    return validateQuery;
}

export const commonParamValidate = (...keys) => {
    const validateParam = [];
    keys.forEach(k => {
        validateParam.push(param(k).notEmpty().withMessage(`${k} is required`));
    })

    return validateParam;
}
