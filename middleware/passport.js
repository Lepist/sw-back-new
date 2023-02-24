const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET_KEY
}
module.exports = passport => {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try{
                const [rows, fields] = await connection.execute(`SELECT * FROM users WHERE login = "${payload.login}" LIMIT 1`);
                const user = rows[0];
                if(user){
                    done(null, user)
                }else{
                    done(null, false)
                }
            }catch(err){
                console.log(err)
            }
        })
    )
}