//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const util = require('util');
const fastcsv = require("fast-csv");
const ws = fs.createWriteStream("data.csv");

const readdir = util.promisify(fs.readdir);
const readfil = util.promisify(fs.readFile);

async function init() {
    const directoryPath = path.join(__dirname, 'telemetry');
    let files;
    let rows = 0;
    let vinArr = [];

    try {
      files = await readdir(directoryPath);
    } catch (error) {
      console.log(error);
    }

    let jsonData  = [];

    for(const file of files) {
        let data = await readFile(directoryPath + '/' + file);

        for(const item of data) {

            let row = {
                MessageId: item.MessageId,
                CreationTimeStamp: item.CreationTimeStamp,
                SendTimeStamp: item.SendTimeStamp,
                VIN: item.VIN,
                TripId: item.TripId,
                GeoLocationLatitude: item.GeoLocation.Latitude,
                GeoLocationLongitude: item.GeoLocation.Longitude,
                GeoLocationAltitude: item.GeoLocation.Altitude,
                GeoLocationSpeed: item.GeoLocation.Speed,
                GeoLocationHeading: item.GeoLocation.Heading,
                OdometerMetres: item.Odometer.Metres,
                SpeedMax: item.Speed.Max,
                SpeedAverage: item.Speed.Average
            }

            jsonData.push(row);
        }
    }

    fastcsv.write(jsonData , { headers: true })
            .on("finish", function() {
                console.log("Write to CSV successfully!");
            })
            .pipe(ws);


    console.log(rows)
    console.log(files.length);
}

async function readFile(fileName) {
    let data;
    let result = [];

    try {
        data = await readfil(fileName, 'utf8');

        data = data.split(/\r?\n/);

        data.forEach((item) => {
            if(item != '') {
                result.push( JSON.parse(item) )
            }
        } )
    } catch (error) {
        console.log(error)
    }

    return result;
}
  
init();