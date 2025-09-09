import {getDashboardDataByRange} from "../service/dashboard.service.js";

export const getDashboardData = async (req, res) => {
    const range = req?.query?.dateRange || '30d';
    try {
        const size = await getDashboardDataByRange(range);
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