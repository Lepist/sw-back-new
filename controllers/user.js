const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')

module.exports.register = async (req,res) => {
    if(
        !req.body.login || 
        !req.body.password || 
        !req.body.name || 
        !req.body.job_position || 
        !req.body.number ||
        !req.body.region_id
    ){
        return res.status(400).json({
            success: false,
            message: "Не все поля заполнены"
        })
    }
    const [rows, fields] = await connection.execute(`SELECT * FROM users WHERE login = "${req.body.login}" LIMIT 1`);
    const candidate = rows[0];

    if(candidate){
        // Пользователь существует, отправляем ошибку
        res.status(409).json({
            success: false,
            message: 'Такой login уже занят. Попробуйте другой'
        })
    }else{
        // Создаем пользователя
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password
        
        const user = {
            login: req.body.login,
            hash_password: bcrypt.hashSync(password, salt),
            name: req.body.name || null,
            number: req.body.number || null,
            job_position: req.body.job_position || null,
            activated: 0,
            region_id: req.body.region_id || 1
        }

        // Необходимо для того чтобы получить строку в виде: " 'admin', 'best_password', 1, true, 0 "
        let values = Object.values(user).map(value => {
            if(typeof value == 'string') return `'${value}'`
            else if(typeof value == 'undefined' || typeof value == 'null') return 'NULL'
            else return value
        })
        let keys = Object.keys(user).map(key => `\`${key}\``)

        connection.execute(`INSERT INTO \`users\`(${keys}) VALUES (${values})`)
            .then(() => {
                res.status(200).json({
                    success: true,
                    message: 'Пользователь успешно создан',
                    login: user.login,
                    activated: user.activated
                })
            })
            .catch(err => errorHandler(res, err))
    }
}

module.exports.activate = async (req, res) => {
    
}

module.exports.deactivate = async (req, res) => {

}
module.exports.delete = async (req, res) => {

}
module.exports.addAdmin = async (req, res) => {

}
module.exports.addModerator = async (req, res) => {

}
module.exports.deleteAdmin = async (req, res) => {

}
module.exports.deleteModerator = async (req, res) => {

}
module.exports.getAllUsers = async (req, res) => {

}
module.exports.getUserById = async (req, res) => {
    //req.params.id
}