const errorHandler = require('../utils/errorHandler')
const getLoginByToken = require('../utils/getLoginByToken')
const getFormattedBarChartDataMailings = require('../utils/getFormattedBarChartDataMailings')
const getFormattedDoughnutChartDataFeedbacks = require('../utils/getFormattedDoughnutChartDataFeedbacks')

module.exports.getAllData = async (req,res) => {
    try {
        let analytics_data = {
            mailings_count: 0,
            feedbacks_count: 0,
            bot_templates_count: 0,
            depots_count: 0,
            
        };

        let userData = await tokenService.decodeAccessToken(req.headers.authorization);
        if(!userData?.user_id) return res.status(401).json({
            success: false,
            message: 'Проблема с токеном, в токене нет user_id'
        })
        
        
        let [rows, fields] = await connection.execute(`SELECT COUNT('id') as bot_templates_count FROM bot_templates WHERE user_id = ${userData.user_id}`);
        analytics_data.bot_templates_count = rows[0][`COUNT('id')`];

        return res.status(200).json({
            success: true,
            formatted_depots
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send()
    }
}