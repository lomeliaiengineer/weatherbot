const dialogflow = require('@google-cloud/dialogflow');

async function detectIntent(projectId, utterance, session) {
    const sessionId = session;
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: utterance,
                languageCode: 'en',
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        console.log('Detected intent');
        const result = responses[0].queryResult;
        if (result.intent) {
            console.log(`Intent: ${result.intent.displayName}`);
            return { intent: result.intent.displayName, parameters: result.parameters };
        } else {
            console.log(`No intent matched.`);
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = { detectIntent }