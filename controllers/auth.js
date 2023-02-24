const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')
const tokenService = require('../services/tokenService')

module.exports.login = async (req,res) => {
    try {
        var [rows, fields] = await connection.execute(`SELECT * FROM users WHERE login = "${req.body.login}" LIMIT 1`);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Ошибка при отправке запроса. ${error.message}`
        })
    }
    const candidate = rows[0];

    if(candidate){
        // Проверка пароля, пользователь существует
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.hash_password);
        if(passwordResult){
            // Выкидываем ошибку, не даем залогиниться, если аккаунт не активирован
            if(candidate.activated == 0) return res.status(400).json({
                message: 'Аккаунт не активирован',
                login: candidate.login,
                activated: candidate.activated
            })

            // Генерация токенов, пароли совпали
            const { access_token, refresh_token } = await tokenService.generateTokens({
                login: candidate.login,
                user_id: candidate.id
            })

            // Сохраняем рефреш токен в БД
            await tokenService.saveRefreshToken(candidate.id, refresh_token)

            res.cookie('refreshToken', refresh_token, {maxAge: 30*24*60*60*1000, httpOnly: true}) // 30d
            res.status(200).json({
                success: true,
                message: 'Вы успешно авторизовались',
                user: candidate.login,
                access_token,
                refresh_token
            })
        }else{
            res.status(400).json({
                success: false,
                message: 'Пароли не совпадают. Попробуйте снова.'
            })
        }
    }else{
        // Пользователя нет, ошибка
        res.status(404).json({
            success: false,
            message: 'Пользователь с таким login не найден.'
        })
    }
}

module.exports.logout = async (req, res) => {
    const { refreshToken } = req.cookies;
    if(refreshToken){
        res.clearCookie('refreshToken')
        await connection.execute(`DELETE FROM refresh_tokens WHERE token='${refreshToken}'`)
    }
    
    return res.status(200).json({
        success: true,
        message: `Вы успешно вышли из аккаунта`
    })
}

// обновление токенов (access, refresh)
module.exports.refresh = async (req, res) => {
    const refresh_token_from_user = req.cookies.refreshToken;
    if(!refresh_token_from_user) return res.status(412).json({
        message: 'Не валидный токен'
    })

    let [rows, fields] = await connection.execute(`SELECT * FROM refresh_tokens WHERE token='${refresh_token_from_user}'`);
    let tokenFromBd = rows[0]?.token;

    let userData = await tokenService.validateRefreshToken(refresh_token_from_user);

    if(!tokenFromBd || !userData) return res.status(412).json({
        message: 'Не валидный токен или токен не был найден в БД'
    })

    let data = await connection.execute(`SELECT * FROM users WHERE id = ${userData.user_id} LIMIT 1`)
    let user = data[0][0];

    // Генерация новых токенов
    const { access_token, refresh_token } = await tokenService.generateTokens({
        login: user.login,
        user_id: user.id
    })

    // Сохраняем рефреш токен в БД
    await tokenService.saveRefreshToken(user.id, refresh_token)

    res.cookie('refreshToken', refresh_token, {maxAge: 30*24*60*60*1000, httpOnly: true}) // 30d
    return res.status(200).json({
        access_token,
        refresh_token
    })

}