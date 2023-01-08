const TelegramBot = require('node-telegram-bot-api');
const  express = require('express')
const  cors = require('cors')

const token = '5823953700:AAEfiI7UHgKrJgzZm5fCaNatgZTRa5NHX7k'
const bot = new TelegramBot(token, {polling: true});
const webAppUrl = "https://rococo-tartufo-f41502.netlify.app"

const app = express()
app.use(express.json())
app.use(cors)


bot.on('message', async (msg) => {

    const chatId = msg.chat.id;
    const text = msg.text
    if (text === '/start'){
        await bot.sendMessage(chatId, 'Нажмите на кнопку заполнить форму',{
            reply_markup: {
                keyboard: [
                    [{text: "Заполнить форму", web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        });
    }

    /*if (text === '/go'){
        await bot.sendMessage(chatId, 'Нажмите на кнопку заполнить форму2',{
            reply_to_message_id: msg.message_id,
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Поделится ботом', web_app: {url: webAppUrl}}]
                ]
            })});
    }*/

    if(msg?.web_app_data?.data){
        console.log(msg?.web_app_data?.data)
        try{
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId, 'Спасибо!')
            await bot.sendMessage(chatId,'Страна: '+data?.country)
            await bot.sendMessage(chatId,'Улица: '+data?.street)

             setTimeout(async () => {
                 await bot.sendMessage(chatId,'Мы рады, что Вы пользуетесь нашим ботом')
             },1500)
        }catch (e){
            console.log(e)
        }

    }
});

app.post('/web-data', async (req,res)=>{
    const { queryId, products, totalPrice} = req.body
    try{
        await bot.answerWebAppQuery(
            queryId,
            {
                id: queryId,
                type: "article",
                title: "Покупка совершена",
                input_message_content: {
                    message_text: `Покупка успешно совершена. Сумма:  ${totalPrice}`
                }
            }
        )
        return res.status(200).json({})
    }catch (e){
        await bot.answerWebAppQuery(
            queryId,
            {
                id: queryId,
                type: "article",
                title: "Покупка отклонена",
                input_message_content: {
                    message_text: `Не удалось преобрести товар`
                }
            }
        )
        return res.status(500).json({})
    }
})

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`server started on port = ${PORT}`)
})