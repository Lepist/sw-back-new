const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')

class TokenService {
    async generateTokens(payload) {
        const access_token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {expiresIn: '30m'}) // время жизни токена
        const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '30d'})
        return {
            access_token,
            refresh_token
        }
    }

    async saveRefreshToken(user_id, refresh_token) {
        let [rows, fields] = await connection.execute(`SELECT * FROM refresh_tokens WHERE user_id = ${user_id}`)
        // Если нашли токен в БД
        if(rows[0]) return await connection.execute(`UPDATE refresh_tokens SET token = '${refresh_token}' WHERE user_id = ${user_id}`);
        
        [rows, fields] = await connection.execute(`INSERT INTO refresh_tokens(user_id, token) VALUES (${user_id},'${refresh_token}')`)
        return rows[0]
    }

    async findToken(refresh_token) {
        let [rows, fields] = await connection.execute(`SELECT * FROM refresh_tokens WHERE token = ${refresh_token}`)
        return rows[0]
    }

    async validateRefreshToken(refresh_token) {
        return jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET_KEY)
    }

    async decodeAccessToken(access_token) {
        if (access_token) {
            access_token = access_token.split(' ');
            access_token = access_token[1];
            return await jwtDecode(access_token);
        } else {
            return false
        }
    }
}


module.exports = new TokenService();