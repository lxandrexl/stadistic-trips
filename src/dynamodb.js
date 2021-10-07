let AWS = require('aws-sdk');
const { v4 } = require('uuid');

AWS.config.update({
    region: "us-east-1",
    accessKeyId: "AKIAXSZZM55ARDIUXJML",
    secretAccessKey: "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"
});

let docClient = new AWS.DynamoDB.DocumentClient();

let table = 'trips';

exports.getStadistics = async () => {
    return await docClient.scan({ TableName: table }).promise();
}

exports.saveData = async (trama) => {
    const params = {
        TableName: table,
        Item: {
            id: v4().toString(),
            messageId: trama.MessageId,
            ts: trama.CreationTimeStamp,
            sts: trama.SendTimeStamp,
            vin: trama.VIN,
            tripId: trama.TripId,
            odometer: trama.Odometer.Metres,
            speed: trama.Speed.Max,
            speedAvg: trama.Speed.Average,
            trama: JSON.stringify(trama)
        }
    }

    return await docClient.put(params).promise();
}

exports.getDataById = async (id) => {
    return await docClient.query({
        TableName: table,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: { ":id": { S: id }}
    }).promise();
}