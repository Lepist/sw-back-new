require('dotenv').config({ path: 'keys.env' }) // импортирует переменные окружения в process.env
const app = require('./app')
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started with port: ${PORT}`))