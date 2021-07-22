require('dotenv').config();
process.env['GOOGLE_APPLICATION_CREDENTIALS'] = 'helpers/weatherbot-advj-cacb2808e34d.json'
const { detectIntent } = require('./helpers/detectIntent');
const messages = require('./messages');

async function MessageHandler(context, event) {
    const projectId = context.simpledb.botleveldata.config.projectId;
    const baseUrl = context.simpledb.botleveldata.config.baseUrl;
    const intent = await detectIntent(projectId, event.message, event.sender);
    if (intent.intent == 'Default Welcome Intent') {
        context.sendResponse(messages.WELCOME);
    } else if (intent.intent == 'Get Weather') {
        if (intent.parameters.fields.city.stringValue) {
            const city = intent.parameters.fields.city.stringValue;
            context.simplehttp.makeGet(`${baseUrl}${city}`);
        } else {
            const lat = intent.parameters.fields.lat.numberValue;
            const long = intent.parameters.fields.long.numberValue;
            context.simplehttp.makeGet(`${baseUrl}${lat},${long}`);
        }
    } else {
        context.sendResponse(messages.FALLBACK);
    }
}

function EventHandler(context, event) {
    context.sendResponse(messages.WELCOME);
}

function HttpResponseHandler(context, event) {
    const weatherJson = JSON.parse(event.getresp);
    if(weatherJson.error){
        context.sendResponse(messages.ERROR);
    }else{
        const { temperature, humidity } = weatherJson.current;
        const city = weatherJson.location.name;
        context.sendResponse(`It is currently ${temperature} degrees out in ${city}.  The current humidity is ${humidity}.`);
    }
}

function LocationHandler(context, event) {
    const baseUrl = context.simpledb.botleveldata.config.baseUrl;
    let lat = event.messageobj.latitude;
    let long = event.messageobj.longitude;
    context.simplehttp.makeGet(`${baseUrl}${lat},${long}`);
}

exports.onMessage = MessageHandler;
exports.onEvent = EventHandler;
exports.onHttpResponse = HttpResponseHandler;
if (typeof LocationHandler == 'function') {
    exports.onLocation = LocationHandler;
}
