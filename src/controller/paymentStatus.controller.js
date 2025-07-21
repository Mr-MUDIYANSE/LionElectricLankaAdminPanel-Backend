import {getAllPaymentStatus} from "../service/paymentStatus.service.js";

export const getPaymentStatus = async (req, res) => {
    try {
        const size = await getAllPaymentStatus();
        res.status(200).json({
            success: true,
            message: 'All payment status retrieved',
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