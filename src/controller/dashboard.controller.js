import {getDashboardDataByRange} from "../service/dashboard.service.js";

export const getDashboardData = async (req, res) => {
    const date = req?.query?.date;
    try {
        const size = await getDashboardDataByRange(date);
        res.status(200).json({
            success: true,
            message: 'All dashboard data retrieved',
            data: size
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};