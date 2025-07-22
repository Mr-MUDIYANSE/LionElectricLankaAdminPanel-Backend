import {getAllPaymentMethod} from "../service/paymentMethod.service.js";

export const getPaymentMethods = async (req, res) => {
    try {
        const size = await getAllPaymentMethod();
        res.status(200).json({
            success: true,
            message: 'All payment methods retrieved',
            data: size
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};