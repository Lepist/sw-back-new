const errorHandler = require('../utils/errorHandler')
const getLoginByToken = require('../utils/getLoginByToken')

module.exports.getAll = async (req,res) => {
    // // Декодируем JWT токен получая данные пользователя (логин, когда истечет срок годности токена и тд.)
    // // Отсюда нужен только логин для формирования запросов к БД по конкретному пользователю
    // let userData = await getLoginByToken(req.headers.authorization);
    // /* useData прилетает в таком виде
    // userData = {
    //     login: 'admin2',
    //     userId: '6251eddf7b5a8692d3395276',
    //     iat: 1649536565,
    //     exp: 1649540165
    //   }
    // */

    // const accounts = await Account.find({user: userData.login});
    // if(accounts.length){
    //     res.status(200).json({
    //         success: true,
    //         message: 'Аккаунты найдены в базе данных.',
    //         accounts
    //     })
    // }else{
    //     res.status(404).json({
    //         success: false,
    //         message: 'Аккаунты не найдены в базе данных.'
    //     })
    // }
}

module.exports.create = async (req,res) => {
    // let userData = await getLoginByToken(req.headers.authorization); /* Комментарий по этой функции в первом роуте(выше) */

    // const candidateAccount = await Account.find({number: req.body.number});
    // console.log(candidateAccount);
    // if(candidateAccount.length){
    //     // Пользователь существует, отправляем ошибку
    //     res.status(409).json({
    //         success: false,
    //         message: 'Такой Аккаунт уже создан'
    //     })       
    // }else{
    //     const account = new Account({
    //         number: req.body.number,
    //         sessionData: req.body.sessionData,
    //         user: userData.login,
    //         public: false
    //     })
    //     try {
    //         await account.save()
    //             .then(() => {
    //                 res.status(200).json({
    //                     success: true,
    //                     message: 'Аккаунт успешно создан',
    //                     account
    //                 })
    //             })
    //     } catch (err) {
    //         errorHandler(res, err)
    //     }
    // }

}

module.exports.delete = async (req,res) => {
    // const candidateAccount = await Account.find({number: req.body.number});
    // if(candidateAccount){
    //     await Account.deleteOne({number: req.body.number});
    //     res.status(200).json({
    //         success: true,
    //         message: 'Аккаунт успешно удален'
    //     })
    // }else{
    //     res.status(404).json({
    //         success: false,
    //         message: 'Аккаунт не найден в базе данных'
    //     })
    // }
}

