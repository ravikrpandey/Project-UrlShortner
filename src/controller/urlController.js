

const urlModel = require('../model/urlModel')
const shortid = require('shortid')


const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    12381,
    "redis-12381.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("TJvkt2L7N6K6bHx4TyCKK8tT0QT1Rtut", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);




const isValid = function (value) {

    if (typeof value === "undefined" || typeof value === null) return false
    if (typeof value === String && value.trim().length === 0) return false
    return true;
}

const isValidURL = function (value) {
    if (!(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%\+.~#?&//=]*)/.test(value)))
        return false

    return true
}

exports.urlShortner = async (req, res) => {

    try {

        let data = req.body
        let { longUrl } = data //destracture

        if (!Object.keys(data).length > 0) {
            return res.status(400).send({ status: false, msg: "please provide data" })
        }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "please enter url" })
        }
        if (!isValidURL(longUrl)) {
            return res.status(400).send({ status: false, msg: "please enter valid url" })
        }

        let urlCode = shortid.generate()

        let baseUrl = "http://localhost:3000"



        let shortUrl = baseUrl + '/' + urlCode

        data.urlCode = urlCode
        data.shortUrl = shortUrl
        let findUrl2 = await urlModel.findOne({ longUrl: longUrl },{_id:0,__v:0})

        if (findUrl2) {

            longUrl = findUrl2.longUrl

           
            return res.status(201).send({ status: true, data: findUrl2 })
        }

        await urlModel.create(data)

        let findUrl = await urlModel.findOne({ urlCode: urlCode }).select({ __v: 0, _id: 0 })


        return res.status(201).send({ status: true, data: findUrl })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};

exports.getUrl = async (req, res) => {

    try {

        let urlCode = req.params.urlCode

        if (!urlCode) {
            return res.status(400).send({ status: false, msg: "please enter urlCode in Params" })
        }
        let cahcedProfileData = await GET_ASYNC(`${urlCode}`)

        if (cahcedProfileData) {
            let URL = JSON.parse(cahcedProfileData).longUrl
            
            return res.status(302).redirect(URL)

        }
        else {

            let findUrl = await urlModel.findOne({ urlCode: urlCode }, { longUrl: 1, _id: 0 })
            if (!findUrl) { return res.status(404).send({ status: false, msg: "No data found with this urlCode" }) }
            longUrl = findUrl.longUrl
            
            redisClient.setex(`${urlCode}`, 3600, JSON.stringify(findUrl));

            // await SET_ASYNC(`${urlCode}`, '3600s', JSON.stringify(findUrl))

            return res.status(302).redirect(longUrl)
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};