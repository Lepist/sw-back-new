const tokenService = require('../services/tokenService');
const errorHandler = require('../utils/errorHandler')

// Получаем все свои шаблоны бота
module.exports.getMyBotTemplates = async (req, res) => {
    let bot_templates = []
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
            SELECT * FROM bot_templates
            WHERE user_id = ${userData.user_id}
            ORDER BY id DESC
            LIMIT ${limit}
            OFFSET ${(page-1) * limit}
        `);
        bot_templates = rows;
        // Получаем количество точек созданные данным юзером => получаем количество страниц
        [rows, fields] = await connection.execute(`SELECT COUNT(*) FROM bot_templates WHERE user_id = ${userData.user_id}`);
        countOfPages = Math.ceil(rows[0]['COUNT(*)']/limit)

        for(let i = 0; i < bot_templates.length; i++){
            let [rows, fields] = await connection.execute(`
                SELECT * FROM scores
                WHERE bot_template_id = ${bot_templates[i].id}
            `);
        
            bot_templates[i].scores = rows
        }

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

module.exports.create = async (req, res) => {
    let userData = await tokenService.decodeAccessToken(req.headers.authorization);

    if(!userData?.user_id) return res.status(401).json({
        success: false,
        message: 'Проблема с токеном, в токене нет user_id'
    })

    const newTemplate = req.body;
    
    connection.execute(`
        INSERT INTO bot_templates (name, first_message, user_id) 
        VALUES ('${newTemplate.name}', '${newTemplate.first_message}', ${userData.user_id})
    `)
        .then(data => {
            // Добавляем id нового, только что созданного шаблона
            newTemplate.id = data[0].insertId; 
            
            let values = newTemplate.scores.map(score => [score.score, score.message, score.is_positive, newTemplate.id])
            connection.query(`INSERT INTO scores (score, message, is_positive, bot_template_id) VALUES ?`,
                [values]
            )
                .then(data => {
                    return res.status(200).json({
                        success: true,
                        message: 'Шаблон бота успешно создан',
                        newTemplate
                    })
                })
                .catch(async err => { // При ошибке удаляем добавленный выше шаблон, так как произошла ошибка при добавлении оценок к шаблону
                    console.log(err)
                    await connection.execute(`DELETE FROM bot_templates WHERE id = ${newTemplate.id}`)
                    return res.status(500).json({
                        success: false,
                        message: `Произошла ошибка, шаблон бота не был создан. ${err.message}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: `Произошла ошибка, шаблон бота не был создан. ${err.message}`
            })
        }) 
}

module.exports.delete = async (req, res) => {
    let template_id = req.body.template_id;

    if(!template_id) return res.status(400).json({
        success: false,
        message: `Необходимо передать template_id`
    })
    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    let [rows, fields] = await connection.execute(`SELECT * FROM bot_templates WHERE id = ${template_id} LIMIT 1`);
    let bot_template = rows[0];
    
    if(!bot_template) return res.status(404).json({
        success: false,
        message: `Шаблон бота с таким ID не найдена в БД`
    })

    if(bot_template.user_id != userData?.user_id) return res.status(400).json({
        success: false,
        message: `Вы не можете удалить шаблон, созданный другим пользователем`
    })
    
    // Удаляем шаблон бота, оценки этого шаблона из таблицы 'scores' сами каскадно удалятся
    connection.execute(`DELETE FROM bot_templates WHERE id = ${template_id}`)
        .then(results => {
            console.log(results)
            return res.status(200).json({
                success: true,
                message: `Шаблон успешно удален`
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: `Ошибка при отправке запроса на удаление шаблона бота в БД. ${err.message}`
            })
        })
}

module.exports.update = async (req, res) => {
    let bot_template = req.body;
    
    if(!bot_template) return res.status(400).json({
        success: false,
        message: `Необходимо передать в req.body данные о шаблоне бота`
    })

    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    let [rows, fields] = await connection.execute(`SELECT * FROM bot_templates WHERE id = ${bot_template.id} LIMIT 1`);
    let bot_template_data_from_bd = rows[0];
    
    if(!bot_template_data_from_bd) return res.status(404).json({
        success: false,
        message: `Шаблон бота не найден в БД`
    })

    if(userData.user_id != bot_template_data_from_bd.user_id) return res.status(400).json({
        success: false,
        message: `Вы не можете изменить данные чужого шаблона бота`
    })

    connection.execute(`
        UPDATE bot_templates 
        SET name='${bot_template.name}', first_message='${bot_template.first_message}' 
        WHERE id = ${bot_template_data_from_bd.id}
    `)
        .then(() => {
            connection.execute(`DELETE FROM scores WHERE bot_template_id = ${bot_template.id}`)
            .then(async data => {
                let values = bot_template.scores.map(score => [score.score, score.message, score.is_positive, bot_template.id])
                connection.query(`INSERT INTO scores (score, message, is_positive, bot_template_id) VALUES ?`, [values])
                    .then(data => {
                        return res.status(200).json({
                            success: true,
                            message: `Шаблон бота успешно обновлен`
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            success: false,
                            message: `Ошибка при отправке запроса на добавление оценок в БД. ${err.message}`
                        })
                    })
            })
            .catch(err => {
                return res.status(500).json({
                    success: false,
                    message: `Ошибка при отправке запроса на удаление оценок в БД. ${err.message}`
                })
            })
            
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                success: false,
                message: `Ошибка при отправке запроса на удаление шаблона бота в БД. ${err.message}`
            })
        })
}

module.exports.getAllFormattedBotTemplates = async (req,res) => {
    try {
        let userData = await tokenService.decodeAccessToken(req.headers.authorization);

        const [rows, fields] = await connection.execute(`SELECT id, name FROM bot_templates WHERE user_id = ${userData.user_id}`);
        let formatted_bot_templates = rows.map(template => {
            return {
                label: template.name,
                value: template.id
            }
        })
        return res.status(200).json({
            success: true,
            formatted_bot_templates
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send()
    }
}