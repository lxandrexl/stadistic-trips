//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const util = require('util');
const db= require('./dynamodb');

const readdir = util.promisify(fs.readdir);
const readfil = util.promisify(fs.readFile);

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

    for(const file of files) {
        let data = await readFile(directoryPath + '/' + file);
        let newVIN = true;

        for(const item of data) {
            //let rs = await db.saveData(item);
            rows++;

            for(const key in vinArr) {
                if(key == item.VIN) {
                    newVIN = false;
                }
            }

            if(newVIN) {
                vinArr[item.VIN] = [];
                vinArr[item.VIN].push(item)       
            } else {
                for(const key in vinArr) {
                    if(key == item.VIN) {
                        vinArr[key].push(item) 
                    }
                }
            }

            newVIN = true;
        }
    }

    console.log(rows, " tramas revisadas.")

    console.log("=========================")

    for(const key in vinArr) {
        const items = vinArr[key];
        let newTripId = true;
        let trips = [];
        let odometer = [];

        


        for(const item of items) {
            for(const trip of trips) {
                if(trip == item.TripId) {
                    newTripId = false;
                }
            }

            if(newTripId) {
                trips.push(item.TripId);
            }

            newTripId = true;

                odometer.push(item.Odometer.Metres)
        }

        let dataOdometer = getMinMax(odometer);
        
        console.log("VIN: ",key)
        console.log("Total de viajes realizados: ", trips.length);
        console.log('Km. del viaje mas largo:', dataOdometer.max);

        console.log('#############')
        console.log('#############')

    }

}


function getMinMax(arr) {
    let min = arr[0];
    let max = arr[0];
    let i = arr.length;
      
    while (i--) {
      min = arr[i] < min ? arr[i] : min;
      max = arr[i] > max ? arr[i] : max;
    }
    return { min, max };
}

  
init();