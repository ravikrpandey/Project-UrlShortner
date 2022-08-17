const express = require('express')
const bodyparser = require('body-parser')
const route = require('./routes/routes')
const mongoose = require('mongoose')

const app = express()

/*------------------------------------------Bind Application Level Middleware:-------------------------------------------*/

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))


/*------------------------------------------Connecting Data-Base:-------------------------------------------*/

mongoose.connect("mongodb+srv://RahulChauhan:3aDm5xdCx8MiuHql@cluster0.xzyyibs.mongodb.net/urlShortner-project",{
    useNewUrlParser: true
})

.then(() => console.log("MongoDb is connected"))
.catch(err => console.log(err))


app.use('/' , route)


app.listen(process.env.PORT  || 3000, function(){
    console.log('express app runing on port' + (process.env.PORT || 3000))
})