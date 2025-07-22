import DB from "../db/db.js";

export const getAllPaymentMethod = async () => {
    const allSizes = await DB.payment_Method.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allSizes || [];
};