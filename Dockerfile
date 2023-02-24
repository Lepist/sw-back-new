# Подробная инструкция по всем этапам расписана в Dockerfile'е Front'а
FROM node:16-alpine

COPY ./app .

COPY keys.env .

RUN npm install --save-prod

CMD ["npm", "run", "start"]