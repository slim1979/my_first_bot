const TelegramBot = require('node-telegram-bot-api')
const debug = require('./helpers')
const Sequelize = require('sequelize')
const TOKEN ='481138338:AAHnHTsLOjDM9M6UQpVqwFsauUt2BV-wiOg'
console.log(' ');
console.log('Bot has been started');
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
})

const sequelize = new Sequelize('gse_development', 'postgres', 'admin-psql', {
  host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  // operatorsAliases: false
})
// const DATABASE_URL = 'https://ooobalance.herokuapp.com/'
// const sequelize = new Sequelize('dbbjfdq0vocaee', 'miheemgydbgnwx', 'da7d5e9decdb67e0278978b036bb1e6cd3912612c7b307d09a19fdb46406e8b5', {
//   host: 'ec2-204-236-239-225.compute-1.amazonaws.com',
//   connectionString: process.env.DATABASE_URL,
//   ssl: true,
//
//
//   dialect: 'postgres',
//   ssl: true,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   },
//
//   // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
//   // operatorsAliases: false
// })

// const sequelize = new Sequelize('postgres://miheemgydbgnwx:da7d5e9decdb67e0278978b036bb1e6cd3912612c7b307d09a19fdb46406e8b5@ec2-204-236-239-225.compute-1.amazonaws.com:5432/dbbjfdq0vocaee')

sequelize.sync()
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err))

const User = sequelize.define('users', {
  email: {
    type: Sequelize.STRING,
    field: 'email'
  },
},{
  timestamps: false,
  connectionString: process.env.DATABASE_URL,
  ssl: true,

});

const Question = sequelize.define('question', {
  title: {
    type: Sequelize.STRING,
    field: 'title'
  },
  body: {
    type: Sequelize.STRING,
    field: 'body'
  },
},{
  timestamps: false,
  connectionString: process.env.DATABASE_URL,
  ssl: true,


});

User.findById(1).then( user => {
  console.log('User email: ' + user.email);
})

function test(chatId) {
  Question.findAll()
  .then( question => {
    var info = question.map((q,i) => {
      return `Question #` + q.id + `. \ntitle: [`  + q.title + `](http://b6fdfbe0.ngrok.io/questions/` + q.id + `)\nbody: _` + q.body + `_`
    }).join('\n')
    bot.sendMessage(chatId, info, {
      parse_mode: 'Markdown'
    })
  })
}

bot.on('message', msg => {
  const chatId = msg.chat.id

  if (msg.text === 'Закрыть') {
    bot.sendMessage(chatId, 'Закрываю клавиатуру', {
      reply_markup :{
        remove_keyboard: true
      }
    })
  } else if (msg.text === 'Ответить') {
    bot.sendMessage(chatId, 'Ответ:')
    test(chatId)
  } else {
    bot.sendMessage(chatId, 'Включаю клавиатуру', {
    reply_markup: {
      keyboard: [
        [{
          text: 'Отправить местоположение',
          request_location: true
        }],
        ['Ответить', 'Закрыть'],
        [{
          text: 'Отправить контактные данные',
          request_contact: true
        }]
      ],
      one_time_keyboard: true
    }
  })
  }
})
