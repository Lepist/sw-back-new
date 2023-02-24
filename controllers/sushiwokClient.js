const tokenService = require('../services/tokenService');
const errorHandler = require('../utils/errorHandler')

// Получаем все свои ТТ
module.exports.getClients = async (req, res) => {
    let sushiwok_clients = []
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
            SELECT *
            FROM sushiwok_clients
            ORDER BY sushiwok_clients.id DESC
            LIMIT ${limit}
            OFFSET ${(page-1) * limit}
        `);
        sushiwok_clients = rows;
        // Получаем количество точек созданные данным юзером => получаем количество страниц
        [rows, fields] = await connection.execute(`SELECT COUNT(*) FROM sushiwok_clients`);
        countOfPages = Math.ceil(rows[0]['COUNT(*)']/limit)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: `Ошибка при запросе к БД. ${error.message}`
        })
    }

    if (sushiwok_clients.length) {

        return res.status(200).json({
            success: true,
            message: 'Клиенты успешно найдены в базе данных',
            sushiwok_clients,
            countOfPages,
            limit,
            page
        })
    }else{
        return res.status(404).json({
            success: true,
            message: 'Клиенты не найдены в базе данных'
        })
    }
}

module.exports.delete = async (req, res) => {
    let client_id = req.body.client_id;

    if(!client_id) return res.status(400).json({
        success: false,
        message: `Необходимо передать client_id`
    })

    let [rows, fields] = await connection.execute(`SELECT * FROM sushiwok_clients WHERE id = ${client_id} LIMIT 1`);
    let depot = rows[0];
    
    if(!depot) return res.status(404).json({
        success: false,
        message: `Клиент с таким id не найден в БД`
    })

    
    connection.execute(`DELETE FROM sushiwok_clients WHERE id = ${client_id}`)
        .then(() => {
            return res.status(200).json({
                success: true,
                message: `Данные клиента успешно удалены`
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: `Ошибка при отправке запроса на удаление точки в БД. ${err.message}`
            })
        })
}

module.exports.update = async (req, res) => {
    let client = req.body;
    
    if(!client) return res.status(400).json({
        success: false,
        message: `Необходимо передать в req.body данные о клиенте`
    })

    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    let [rows, fields] = await connection.execute(`SELECT * FROM sushiwok_clients WHERE id = ${client.id} LIMIT 1`);
    let client_data_from_bd = rows[0];
    
    if(!client_data_from_bd) return res.status(404).json({
        success: false,
        message: `Клиент не найден в БД`
    })


    connection.execute(`UPDATE sushiwok_clients 
        SET name='${client.name}',
        number='${client.number}',
        uid='${client.uid}',
        is_banned='${client.is_banned}'
        WHERE id = ${client_data_from_bd.id}`
    )
        .then(() => {
            return res.status(200).json({
                success: true,
                message: `Данные о клиенте успешно обновлены`
            })
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                success: false,
                message: `Ошибка при отправке запроса на обновление данных клиента в БД. ${err.message}`
            })
        })
}