const errorHandler = require('../utils/errorHandler')
const getLoginByToken = require('../utils/getLoginByToken')

module.exports.getCountOfPages = async (req, res) => {
    /*  body: {
            user(данные какого юзера скинуть), 
            mailingsOnPage(сколько рассылок будет на странице)  
        }
    */

    // Декодируем JWT токен получая данные пользователя (логин, когда истечет срок годности токена и тд.)
    // Отсюда нужен только логин для формирования запросов к БД по конкретному пользователю
    let userData = await getLoginByToken(req.headers.authorization);

    if (!userData) {
        return res.status(401).json({
            success: false,
            message: 'Необходимо авторизоваться'
        })
    }
    
    // Проверка: юзер запросил свои данные или это админский аккаунт, у которого есть доступ к данным всех пользователей
    let user = await User.findOne({login: userData.login})
    if(userData.login != req.body.user && !user.isAdmin){
        return res.status(403).json({
            success: false,
            message: 'Отказано в доступе. Вы можете запросить только свои данные'
        })
    }
    try {
        var mailingsCount = await Mailing.find({ initiator: req.body.user }).count();
    } catch (err) {
        errorHandler(res, err)
    }
    let countOfPages = Math.ceil(mailingsCount / req.body.mailingsOnPage); // округление в большую часть (151 рассылка / 7 = 21.57 = 22 страницы)
    return res.status(200).json({
        success: true,
        countOfPages,
        countOfMailings: mailingsCount
    })

}

module.exports.getAll = async (req,res) => {
    /*  req.params: user(данные какого юзера скинуть), pageNumber(какую страничку скинуть), 
                    mailingsOnPage(сколько рассылок будет на странице), 
                    mailingsForm (форма в которой нужны данные (в группе по дням, неделям, месяца, или просто подряд))
    */
    // Декодируем JWT токен получая данные пользователя (логин, когда истечет срок годности токена и тд.)
    // Отсюда нужен только логин для формирования запросов к БД по конкретному пользователю
    let userData = await getLoginByToken(req.headers.authorization);

    if (!userData) {
        res.status(401).json({
            success: false,
            message: 'Необходимо авторизоваться'
        })
    }

    // Проверка: юзер запросил свои данные или это админский аккаунт, у которого есть доступ к данным всех пользователей
    let user = await User.findOne({login: userData.login})
    if(userData.login != req.params.user && !user.isAdmin){
        return res.status(403).json({
            success: false,
            message: 'Отказано в доступе. Вы можете запросить только свои данные'
        })
    }

    try {
        var mailings = await Mailing.find({ initiator: req.params.user });
    } catch (err) {
        errorHandler(res, err)
    }
    if(mailings.length){
        res.status(200).json({
            success: true,
            message: 'Рассылки найдены в базе данных.',
            mailings: mailings.reverse()
        })
    }else{
        res.status(404).json({
            success: false,
            message: 'Еще нет ни одной рассылки'
        })
    }
}

module.exports.getMailingsOfAllUsers = async (req,res) => {
    return res.status(200).json({})
    // try {
    //     var mailings = await Mailing.find();
    // } catch (err) {
    //     errorHandler(res, err)
    // }
    // if(mailings.length){
    //     res.status(200).json({
    //         success: true,
    //         message: 'Рассылки найдены в базе данных.',
    //         mailings
    //     })
    // }else{
    //     res.status(404).json({
    //         success: false,
    //         message: 'Еще нет ни одной рассылки'
    //     })
    // }
}

module.exports.create = async (req,res) => {

    let newMailing = new Mailing({
        status: req.body.status,
        initiator: req.body.initiator,
        account: req.body.account,
        numbers: req.body.numbers,
        templates: req.body.templates,
        point: req.body.point,
        date: req.body.date
    })
    try {
        await newMailing.save()
            .then(() => {
                res.status(200).json({
                    success: true,
                    message: 'Рассылка успешно создана',
                    mailing: newMailing
                })
            })
    } catch (err) {
        errorHandler(res, err)
    }
}

module.exports.updateStatus = async (req,res) => {
    try {
        await Mailing.updateOne({ _id: req.body._id }, { $set: {status: req.body.status} })
            .then(data => {
            console.log(data)
            res.status(200).json({
                success: true,
                message: 'Статус рассылки успешно обновлен'
            })
        }) 
    }catch(err) {
        errorHandler(res, err)
    }
}

module.exports.updateMailing = async (req,res) => {
    try {
        await Mailing.updateOne({_id: req.body._id}, { $set: { numbers: req.body.numbers } })
            .then(data => {
            console.log(data)
            res.status(200).json({
                success: true,
                message: 'Рассылка успешно обновлена'
            })
        }) 
    }catch(err) {
        errorHandler(res, err)
    }
}

module.exports.delete = async (req,res) => {
    try {
        await Mailing.findOneAndRemove({_id: req.body._id})
            .then(data => {
            res.status(200).json({
                success: true,
                message: 'Рассылка успешно удалена'
            })
        }) 
    }catch(err) {
        errorHandler(res, err)
    }
}

module.exports.updateAccount = async (req,res) => {
    try {
        await Mailing.updateOne({ _id: req.body._id }, { $set: {account: req.body.account} })
            .then(data => {
            console.log(data)
            res.status(200).json({
                success: true,
                message: 'Аккаунт рассылки успешно обновлен'
            })
        }) 
    }catch(err) {
        errorHandler(res, err)
    }
}

module.exports.createMany = async (req, res) => {
    let newMailing = new Mailing({
        status: req.body.status,
        initiator: req.body.initiator,
        account: req.body.account,
        numbers: req.body.numbers,
        templates: req.body.templates,
        point: req.body.point,
        date: req.body.date
    })
    try {
        await newMailing.save()
            .then(() => {
                res.status(200).json({
                    success: true,
                    message: 'Рассылка успешно создана',
                    mailing: newMailing
                })
            })
    } catch (err) {
        errorHandler(res, err)
    }
}

module.exports.getMyMailings = async (req, res) => {
    /*
        // короткая инфа о рассылке
        SELECT mailings.id, 
            mailings.depot_id, 
            mailings.user_id, 
            mailings.creation_date, 
            mailings.completion_date, 
            mailings.mailing_status_id, 
            mailings_statuses.name AS mailing_status_name, 
            mailings_statuses.description AS mailing_status_description
        FROM mailings
        JOIN mailings_statuses ON mailings.mailing_status_id = mailings_statuses.id
        WHERE mailings.user_id = 3;
    */
    let mailings = [];
    let limit = +req.query.limit || 10;
    let page = +req.query.page || 1;
    let sortBy = req.query.sort_by || 'mailings';
    let countOfPages = 0;

    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    
    if(!userData?.user_id) return res.status(401).json({
        success: false,
        message: 'Проблема с токеном, в токене нет user_id'
    })

    try {
        let [rows, fields] = await connection.execute(`
            SELECT * FROM mailings
            WHERE user_id = ${userData.user_id}
            ORDER BY id DESC
            LIMIT ${limit}
            OFFSET ${(page-1) * limit}
        `);
        mailings = rows;
        // Получаем количество точек созданные данным юзером => получаем количество страниц
        [rows, fields] = await connection.execute(`SELECT COUNT(*) FROM mailings WHERE user_id = ${userData.user_id}`);
        countOfPages = Math.ceil(rows[0]['COUNT(*)']/limit);

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: `Ошибка при запросе к БД. ${error.message}`
        })
    }
    if (bot_templates.length) {
        return res.status(200).json({
            success: true,
            message: 'Шаблоны бота успешно найдены в базе данных',
            bot_templates,
            countOfPages,
            limit,
            page
        })
        
    }else{
        return res.status(404).json({
            success: true,
            message: 'Шаблоны бота не найдены в базе данных'
        })
    }
}