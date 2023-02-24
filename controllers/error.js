const errorHandler = require('../utils/errorHandler')

module.exports.getAll = async (req,res) => {
    const errors = await ErrorModel.find({});
    if(errors.length){
        res.status(200).json({
            success: true,
            message: 'Ошибки найдены в базе данных',
            errors
        })
    }else{
        res.status(404).json({
            success: false,
            message: 'Ошибки не найдены в базе данных'
        })
    }
}
module.exports.create = async (req,res) => {
    const error = new ErrorModel({
        user: req.body.user || null,
        mailingID: req.body.mailingID || null,
        mailingStatus: req.body.mailingStatus || null,
        server: req.body.server, // required
        errorPath: req.body.errorPath, // required
        handlerMessage: req.body.handlerMessage || null,
        errorMessage: req.body.errorMessage, // required
        date: req.body.date // required
    })
    try {
        await error.save()
            .then(() => {
                res.status(200).json()
            })
    } catch (err) {
        errorHandler(res, err)
    }
}

module.exports.delete = async (req,res) => {
    const candidateError = await ErrorModel.find({_id: req.body._id});
    if(candidateError){
        await ErrorModel.deleteOne({_id: req.body._id});
        res.status(200).json({
            success: true,
            message: 'Ошибка успешно удалена из базы данных'
        })
    }else{
        res.status(404).json({
            success: false,
            message: 'Ошибка не найдена в базе данных'
        })
    }
}
