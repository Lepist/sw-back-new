const errorHandler = require('../utils/errorHandler')
const getLoginByToken = require('../utils/getLoginByToken')

module.exports.getAll = async (req,res) => {
    // Декодируем JWT токен получая данные пользователя (логин, когда истечет срок годности токена и тд.)
    // Отсюда нужен только логин для формирования запросов к БД по конкретному пользователю
    let userData = await getLoginByToken(req.headers.authorization);

    // Проверка: юзер запросил свои данные или это админский аккаунт, у которого есть доступ к данным всех пользователей
    let user = await User.findOne({login: userData.login})
    if(userData.login != req.params.user && !user.isAdmin){
        return res.status(403).json({
            success: false,
            message: 'Отказано в доступе. Вы можете запросить только свои данные'
        })
    }

    const Feedbacks = await Feedback.find({ mailingInitiator: req.params.user });
    if(Feedbacks.length){
        res.status(200).json({
            success: true,
            message: 'Отзывы найдены в базе данных.',
            Feedbacks
        })
    }else{
        res.status(404).json({
            success: false,
            message: 'Отзывы не найдены'
        })
    }

}

module.exports.create = async (req,res) => {
    const newFeedback = new Feedback({
        number: req.body.number,
        rate: req.body.rate,
        feedback: req.body.feedback,
        date: req.body.date,
        status: req.body.status,
        // statuses: 
        manager: req.body.manager,
        comment: req.body.comment,
        mailingInitiator: req.body.mailingInitiator
    })
    await newFeedback.save()
        .then(() => {
            res.status(200).json({
                success: true,
                message: 'Отзыв успешно создан',
                newFeedback
            })
        })
        .catch(err => {
            errorHandler(err.res, err)
        })
}
