import DB from "../db/db.js";

export const getAllPaymentStatus = async () => {
    const allSizes = await DB.payment_Status.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allSizes || [];
};