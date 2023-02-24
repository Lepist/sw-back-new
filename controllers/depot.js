const tokenService = require('../services/tokenService');
const errorHandler = require('../utils/errorHandler')

// Получаем все свои ТТ
module.exports.getMyDepots = async (req, res) => {
    let depots = []
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
            SELECT depots.name, depots.id, adress, region_id, yandex_maps_link, google_maps_link, short_name, depot_type_id, depot_types.name AS depot_type_name, regions.name AS region_name, depots.guid
            FROM depots 
            JOIN depot_types ON depots.depot_type_id = depot_types.id 
            JOIN regions ON depots.region_id = regions.id 
            WHERE user_id = ${userData.user_id}
            ORDER BY depots.id DESC
            LIMIT ${limit}
            OFFSET ${(page-1) * limit}
        `);
        depots = rows;
        // Получаем количество точек созданные данным юзером => получаем количество страниц
        [rows, fields] = await connection.execute(`SELECT COUNT(*) FROM depots WHERE user_id = ${userData.user_id}`);
        countOfPages = Math.ceil(rows[0]['COUNT(*)']/limit)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: `Ошибка при запросе к БД. ${error.message}`
        })
    }

    if (depots.length) {
        return res.status(200).json({
            success: true,
            message: 'Точки успешно найдены в базе данных',
            depots,
            countOfPages,
            limit,
            page
        })
        
    }else{
        return res.status(404).json({
            success: true,
            message: 'Точки не найдены в базе данных'
        })
    }
}


module.exports.create = async (req, res) => {
    let userData = await tokenService.decodeAccessToken(req.headers.authorization);

    if(!userData?.user_id) return res.status(401).json({
        success: false,
        message: 'Проблема с токеном, в токене нет user_id'
    })

    const newDepot = {
        name: req.body.name,
        adress: req.body.adress,
        region_id: req.body.region_id,
        yandex_maps_link: req.body.yandex_maps_link || null,
        google_maps_link: req.body.google_maps_link || null,
        short_name: req.body.short_name,
        depot_type_id: req.body.depot_type_id,
        user_id: userData.user_id,
        guid: req.body.guid || null
    }

    // Необходимо для того чтобы получить строку в виде: " 'depot-name', 'short-name', 1, true, 0 ..."
    let values = Object.values(newDepot).map(value => {

        if(typeof value == 'string' && value == '') return 'NULL'
        if(typeof value == 'string' && value != '') return `'${value}'`
        else if(typeof value == 'undefined' || typeof value == 'object') return "NULL"
        else return value
    })
    console.log(values)
    let keys = Object.keys(newDepot).map(key => `${key}`)
    console.log(`INSERT INTO \`depots\`(${keys}) VALUES (${values})`)
    connection.execute(`INSERT INTO \`depots\`(${keys}) VALUES (${values})`)
            .then(data => {
                console.log(data)
                res.status(200).json({
                    success: true,
                    message: 'Точка успешно создана',
                    newDepot
                })
            })
            .catch(err => errorHandler(res, err)) 
}

module.exports.delete = async (req, res) => {
    let depot_id = req.body.depot_id;

    if(!depot_id) return res.status(400).json({
        success: false,
        message: `Необходимо передать depot_id`
    })
    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    let [rows, fields] = await connection.execute(`SELECT * FROM depots WHERE id = ${depot_id} LIMIT 1`);
    let depot = rows[0];
    
    if(!depot) return res.status(404).json({
        success: false,
        message: `Точка с таким depot_id не найдена в БД`
    })

    if(depot.user_id != userData?.user_id) return res.status(400).json({
        success: false,
        message: `Вы не можете удалить точку, созданную другим пользователем`
    })
    
    connection.execute(`DELETE FROM depots WHERE id = ${depot_id}`)
        .then(() => {
            return res.status(200).json({
                success: true,
                message: `Точка успешно удалена`
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
    let depot = req.body;
    
    if(!depot) return res.status(400).json({
        success: false,
        message: `Необходимо передать в req.body данные о точке`
    })

    let userData = await tokenService.decodeAccessToken(req.headers.authorization);
    let [rows, fields] = await connection.execute(`SELECT * FROM depots WHERE id = ${depot.id} LIMIT 1`);
    let depot_data_from_bd = rows[0];
    
    if(!depot_data_from_bd) return res.status(404).json({
        success: false,
        message: `Точка не найдена в БД`
    })

    if(userData.user_id != depot_data_from_bd.user_id) return res.status(400).json({
        success: false,
        message: `Вы не можете изменить данные чужой точки`
    })

    connection.execute(`UPDATE depots SET name='${depot.name}',
        adress='${depot.adress}',
        region_id=${depot.region_id},
        yandex_maps_link=${depot.yandex_maps_link? `'${depot.yandex_maps_link}'` : 'NULL'},
        google_maps_link='${depot.google_maps_link}',
        short_name='${depot.short_name}',
        depot_type_id=${depot.depot_type_id},
        user_id=${userData.user_id},
        guid='${depot.guid}' 
        WHERE id = ${depot_data_from_bd.id}`
    )
        .then(() => {
            return res.status(200).json({
                success: true,
                message: `Точка успешно обновлена`
            })
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                success: false,
                message: `Ошибка при отправке запроса на удаление точки в БД. ${err.message}`
            })
        })
}

module.exports.getAllFormattedDepots = async (req,res) => {
    try {
        let userData = await tokenService.decodeAccessToken(req.headers.authorization);

        const [rows, fields] = await connection.execute(`SELECT id, name FROM depots WHERE user_id = ${userData.user_id}`);
        let formatted_depots = rows.map(depot => {
            return {
                label: depot.name,
                value: depot.id
            }
        })
        return res.status(200).json({
            success: true,
            formatted_depots
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send()
    }
}