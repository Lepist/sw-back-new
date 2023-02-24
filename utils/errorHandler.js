module.exports = (res, error) => {
    return res.status(500).json({
        success: false,
        message: error.message ? error.message : error
    })
}