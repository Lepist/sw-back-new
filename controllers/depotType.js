module.exports.getAllTypes = async (req, res) => {
    try {
        const [rows, fields] = await connection.execute(`SELECT * FROM depot_types`);
        return res.status(200).json({
            success: true,
            message: `Типы точек успешно загружены`,
            depot_types: rows
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Ошибка при загрузке depot_types из БД. ${error.message}`
        })
    }
}