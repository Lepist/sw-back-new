const errorHandler = require('../utils/errorHandler')

module.exports.getAll = async (req,res) => {
    try {
        const [rows, fields] = await connection.execute(`SELECT * FROM regions`);
        let regions = rows.map(region => {
            delete region.guid;
            return region;
        })
        res.status(200).json({
            success: true,
            regions
        })
    } catch (error) {
        res.status(500).send()
    }
}

module.exports.create = async (req,res) => {

}

module.exports.delete = async (req,res) => {

}

