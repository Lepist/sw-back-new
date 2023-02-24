const tokenService = require('../services/tokenService');
const errorHandler = require('../utils/errorHandler')

// Получаем все свои шаблоны чата
module.exports.getMyChatTemplates = async (req, res) => {
    let chat_templates = []
    let limit = +req.query.limit || 10;
    let page = +req.query.page || 1;
    let countOfPages = 0;

    // Декодируем JWT токен получая данные пользователя (логин, когда истечет срок годности токена и тд.)
    // Отсюда нужен только логин для формирования запросов к БД по конкретному пользователю
    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    
    if(!userData?.user_id) return res.status(401).json({
        success: false,
        message: 'Проблема с токеном, в токене нет user_id'
    })

    try {
        let [rows, fields] = await connection.execute(`
            SELECT * FROM chat_templates
            WHERE user_id = ${userData.user_id}
            ORDER BY id DESC
            LIMIT ${limit}
            OFFSET ${(page-1) * limit}
        `);
        chat_templates = rows;
        // Получаем количество точек созданные данным юзером => получаем количество страниц
        [rows, fields] = await connection.execute(`SELECT COUNT(*) FROM chat_templates WHERE user_id = ${userData.user_id}`);
        countOfPages = Math.ceil(rows[0]['COUNT(*)']/limit)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: `Ошибка при запросе к БД. ${error.message}`
        })
    }

    if (chat_templates.length) {
        return res.status(200).json({
            success: true,
            message: 'Шаблоны чата успешно найдены в базе данных',
            chat_templates,
            countOfPages,
            limit,
            page
        })
        
    }else{
        return res.status(404).json({
            success: true,
            message: 'Шаблоны чата не найдены в базе данных'
        })
    }
}


module.exports.create = async (req, res) => {
    let userData = await tokenService.decodeAccessToken(req.headers.authorization);

    if(!userData?.user_id) return res.status(401).json({
        success: false,
        message: 'Проблема с токеном, в токене нет user_id'
    })

    const newTemplate = {
        text: req.body.text
    }

    connection.execute(`INSERT INTO chat_templates (text, user_id) VALUES ('${newTemplate.text}', ${userData.user_id})`)
            .then(data => {
                res.status(200).json({
                    success: true,
                    message: 'Шаблон чата успешно создан',
                    newTemplate
                })
            })
            .catch(err => errorHandler(res, err)) 
}

module.exports.delete = async (req, res) => {
    let template_id = req.body.template_id;

    if(!template_id) return res.status(400).json({
        success: false,
        message: `Необходимо передать template_id`
    })
    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    let [rows, fields] = await connection.execute(`SELECT * FROM chat_templates WHERE id = ${template_id} LIMIT 1`);
    let chat_template = rows[0];
    
    if(!chat_template) return res.status(404).json({
        success: false,
        message: `Шаблон чата с таким template_id не найдена в БД`
    })

    if(chat_template.user_id != userData?.user_id) return res.status(400).json({
        success: false,
        message: `Вы не можете удалить шаблон, созданный другим пользователем`
    })
    
    connection.execute(`DELETE FROM chat_templates WHERE id = ${template_id}`)
        .then(() => {
            return res.status(200).json({
                success: true,
                message: `Шаблон успешно удален`
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: `Ошибка при отправке запроса на удаление шаблона чата в БД. ${err.message}`
            })
        })
}

module.exports.update = async (req, res) => {
    let chat_template = req.body;
    
    if(!chat_template) return res.status(400).json({
        success: false,
        message: `Необходимо передать в req.body данные о шаблоне чата`
    })

    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    let [rows, fields] = await connection.execute(`SELECT * FROM chat_templates WHERE id = ${chat_template.id} LIMIT 1`);
    let chat_template_data_from_bd = rows[0];
    
    if(!chat_template_data_from_bd) return res.status(404).json({
        success: false,
        message: `Шаблон чата не найден в БД`
    })

    if(userData.user_id != chat_template_data_from_bd.user_id) return res.status(400).json({
        success: false,
        message: `Вы не можете изменить данные чужого шаблона чата`
    })

    connection.execute(`UPDATE chat_templates SET text='${chat_template.text}' WHERE id = ${chat_template_data_from_bd.id}`
    )
        .then(() => {
            return res.status(200).json({
                success: true,
                message: `Шаблон чата успешно обновлен`
            })
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                success: false,
                message: `Ошибка при отправке запроса на удаление шаблона чата в БД. ${err.message}`
            })
        })
}