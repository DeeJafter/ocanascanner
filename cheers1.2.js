const puppeteer = require('puppeteer');
let fs = require('fs');
const createArrayCsvWriter = require('csv-writer').createArrayCsvWriter;
const MongoClient = require('mongodb').MongoClient;
const EventEmitter = require('eventemitter3');
const ObjectId = require('mongodb').ObjectId;

// const client = new MongoClient(uri, { useNewUrlParser: true });
const client = new MongoClient('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
});

// const uri = 'mongodb://localhost:27017/test';

const USERNAME = 'divyansh.juneja@gmail.com';
const PASSWORD = 'chandigarh9';

let dateValue = new Date();
let date = dateValue.getDate().toString().padStart(2, '0');
let month = (dateValue.getMonth() + 1).toString().padStart(2, '0');

// const _id = new ObjectId();
const dd = String(dateValue.getDate()).padStart(2, '0');
const mm = String(dateValue.getMonth() + 1).padStart(2, '0'); // January is 0!
const yyyy = dateValue.getFullYear();
const Time = dateValue.getHours() + ':' + dateValue.getMinutes();
// const _id = `${dd}/${mm}/${yyyy}/${Time}`;
// const _id = `${dd}/${mm}/${yyyy}/${timeStampNf}`;

let filePathBnF = `${month}/${date}-BnF.csv`;
let filePathNf = `${month}/${date}-Nf.csv`;

// Create the directoriesNf leading to the file, if they don't exist
let directoriesNf = filePathBnF.split('/');
let directoryPathNf = '';
for (let i = 0; i < directoriesNf.length - 1; i++) {
  directoryPathNf += directoriesNf[i] + '/';
  if (!fs.existsSync(directoryPathNf)) {
    fs.mkdirSync(directoryPathNf);
  }
}

// Create the directoriesNf leading to the file, if they don't exist
let directoriesBnf = filePathBnF.split('/');
let directoryPathBnF = '';
for (let i = 0; i < directoriesBnf.length - 1; i++) {
  directoryPathBnF += directoriesBnf[i] + '/';
  if (!fs.existsSync(directoryPathBnF)) {
    fs.mkdirSync(directoryPathBnF);
  }
}

const csvWriterNf = createArrayCsvWriter({
  header: [
    // 'cALLS',
    'cResistance',
    'cType',
    'cOI',
    'coiType',
    'coiPerc',
    'cV',
    'cvType',
    'cvPercent',
    'Time',
    'spotPrice',
    // 'PUTS',
    'pSupport',
    'pType',
    'pV',
    'pvType',
    'pvPercent',
    'pOI',
    'poiType',
    'poiPerc',
  ],

  path: filePathNf,
});
const csvWriterBnf = createArrayCsvWriter({
  header: [
    // 'cALLS',
    'cResistance',
    'cType',
    'cOI',
    'coiType',
    'coiPerc',
    'cV',
    'cvType',
    'cvPercent',
    'Time',
    'spotPrice',
    // 'PUTS',
    'pSupport',
    'pType',
    'pV',
    'pvType',
    'pvPercent',
    'pOI',
    'poiType',
    'poiPerc',
  ],

  path: filePathBnF,
});
// ['pSupport', 'pType', 'pOI', 'poiType', 'poiPerc', 'pV', 'pvType', 'pvPercent'];

async function getValuesNf(pageNf) {
  // Evaluate the DOM and extract the valuesBnf

  const valuesNf = await pageNf.evaluate(() => {
    const elements = document.querySelectorAll('#tbldata tr td:nth-child(8)');
    const valuesVl = [];
    for (const element of elements) {
      valuesVl.push(element.textContent);
    }

    return {
      spotVal: document.querySelector('#future_val').textContent ?? null,
      putSummary:
        document.querySelector('#tech-companies-1-col-2').innerText ?? null,
      callSummary:
        document.querySelector('#tech-companies-1-col-0').innerText ?? null,
      cVolTbl: valuesVl,
    };
  });

  // Return the valuesBnf
  return valuesNf;
}
async function getValuesBnf(pageBnF) {
  // Evaluate the DOM and extract the valuesBnf

  const valuesBnf = await pageBnF.evaluate(() => {
    const elements = document.querySelectorAll('#tbldata tr td:nth-child(8)');
    const valuesVl = [];
    for (const element of elements) {
      valuesVl.push(element.textContent);
    }

    return {
      spotVal: document.querySelector('#future_val').textContent ?? null,
      putSummary:
        document.querySelector('#tech-companies-1-col-2').innerText ?? null,
      callSummary:
        document.querySelector('#tech-companies-1-col-0').innerText ?? null,
      cVolTbl: valuesVl,
    };
  });

  // Return the valuesBnf
  return valuesBnf;
}

(async () => {
  await client.connect();
  const collection = client.db('ocanacutest').collection('recordNf');
  try {
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
      headless: false,
      devtools: false,
    });

    const pageBnF = await browser.newPage();
    await pageBnF.setViewport({
      width: 1080,
      height: 900,
      isMobile: false,
      //   hasTouch: false,
      isLandscape: true,
      // isScrollable: true,
      deviceScaleFactor: 1,
    });

    await pageBnF.goto(
      'https://ltp.investingdaddy.com/historical-option-chain.php'
    );

    await pageBnF.waitForSelector('#username');
    await pageBnF.type('#username', USERNAME, { delay: 10 });
    await pageBnF.type(
      'body > div > div > div > div.col-md-12.row > div.col-md-8.col-lg-6.col-xl-4.custome-padding-zero > div.card.overflow-hidden.my-3 > div.card-body.pt-0 > div > form > div:nth-child(4) > div > input',
      PASSWORD,
      { delay: 100 }
    );
    await pageBnF.keyboard.press('Enter');

    await pageBnF.waitForNavigation();

    await pageBnF.goto(
      'https://ltp.investingdaddy.com/detailed-options-chain.php?symbol=BANKNIFTY'
    );

    const pageNf = await browser.newPage();
    await pageNf.setViewport({
      width: 1080,
      height: 900,
      isMobile: false,
      isLandscape: true,
      deviceScaleFactor: 1,
    });

    await pageNf.goto(
      'https://ltp.investingdaddy.com/detailed-options-chain.php?symbol=NIFTY'
    );

    setInterval(async () => {
      const valuesNf = await getValuesNf(pageNf);
      const valuesBnf = await getValuesBnf(pageBnF);

      await pageBnF.waitForSelector('#tech-companies-1-col-2');
      await pageNf.waitForSelector('#tech-companies-1-col-2');

      /// Nf

      let dateValueNf = new Date();

      let hourNf = dateValueNf.getHours().toString().padStart(2, '0');
      let minuteNf = dateValueNf.getMinutes().toString().padStart(2, '0');
      let timeStampNf = `${hourNf}:${minuteNf}`;

      var csummaryNf = valuesNf.callSummary;
      let cdataArrayNf = csummaryNf.split(/ |\n/);

      var psummaryNf = valuesNf.putSummary;
      let pdataArrayNf = psummaryNf.split(/ |\n/);

      let clastElementNf = await cdataArrayNf[cdataArrayNf.length - 1];
      let plastElementNf = await pdataArrayNf[pdataArrayNf.length - 1];

      let c3lastNf = cdataArrayNf[cdataArrayNf.length - 3];
      let c4lastNf = cdataArrayNf[cdataArrayNf.length - 4];
      let c5lastNf = cdataArrayNf[cdataArrayNf.length - 5];
      let c6lastNf = cdataArrayNf[cdataArrayNf.length - 6];

      let p3lastNf = pdataArrayNf[pdataArrayNf.length - 3];
      let p4lastNf = pdataArrayNf[pdataArrayNf.length - 4];
      let p5lastNf = pdataArrayNf[pdataArrayNf.length - 5];
      let p6lastNf = pdataArrayNf[pdataArrayNf.length - 6];

      let hourBnf = dateValueNf.getHours().toString().padStart(2, '0');
      let minuteBnf = dateValueNf.getMinutes().toString().padStart(2, '0');
      let timeStampBnf = `${hourNf}:${minuteNf}`;

      var csummaryBnf = valuesBnf.callSummary;
      let cdataArrayBnf = csummaryBnf.split(/ |\n/);

      var psummaryBnf = valuesBnf.putSummary;
      let pdataArrayBnf = psummaryBnf.split(/ |\n/);

      let clastElementBnf = await cdataArrayBnf[cdataArrayBnf.length - 1];
      let plastElementBnf = await pdataArrayBnf[pdataArrayBnf.length - 1];

      let c3lastBnf = cdataArrayBnf[cdataArrayBnf.length - 3];
      let c4lastBnf = cdataArrayBnf[cdataArrayBnf.length - 4];
      let c5lastBnf = cdataArrayBnf[cdataArrayBnf.length - 5];
      let c6lastBnf = cdataArrayBnf[cdataArrayBnf.length - 6];

      let p3lastBnf = pdataArrayBnf[pdataArrayBnf.length - 3];
      let p4lastBnf = pdataArrayBnf[pdataArrayBnf.length - 4];
      let p5lastBnf = pdataArrayBnf[pdataArrayBnf.length - 5];
      let p6lastBnf = pdataArrayBnf[pdataArrayBnf.length - 6];

      let cVolumeNf = function () {
        if (clastElementNf == 'strong') {
          return (result = c3lastNf);
        } else if (clastElementNf == '') {
          return (result = c6lastNf);
        } else if (clastElementNf.includes('%')) {
          return (result = c5lastNf);
        }
      };

      let cVolumeBnf = function () {
        if (clastElementBnf == 'strong') {
          return (result = c3lastBnf);
        } else if (clastElementBnf == '') {
          return (result = c6lastBnf);
        } else if (clastElementBnf.includes('%')) {
          return (result = c5lastBnf);
        }
      };

      let cvPercentNf = function () {
        if (typeof clastElementNf === 'undefined') return;

        let result = clastElementNf;
        if (result === '') result = cdataArrayNf[cdataArrayNf.length - 2];
        if (typeof result !== 'string') return;
        return result === 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let cvPercentBnf = function () {
        if (typeof clastElementBnf === 'undefined') return;

        let result = clastElementBnf;
        if (result === '') result = cdataArrayBnf[cdataArrayBnf.length - 2];
        if (typeof result !== 'string') return;
        return result === 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let coiPercentNf = function () {
        let result = cdataArrayNf[7] == '-' ? cdataArrayNf[8] : cdataArrayNf[6];
        return result == 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let coiPercentBnf = function () {
        let result =
          cdataArrayBnf[7] == '-' ? cdataArrayBnf[8] : cdataArrayBnf[6];
        return result == 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let cTypeNf = function () {
        if (clastElementNf == 'strong') {
          return (result = clastElementNf);
        } else if (clastElementNf == '') {
          return (result = c4lastNf);
        } else if (clastElementNf.includes('%')) {
          return (result = c3lastNf);
        }
      };

      let cTypeBnf = function () {
        if (clastElementBnf == 'strong') {
          return (result = clastElementBnf);
        } else if (clastElementBnf == '') {
          return (result = c4lastBnf);
        } else if (clastElementBnf.includes('%')) {
          return (result = c3lastBnf);
        }
      };

      let coiTypeNf = function () {
        const result = cdataArrayNf[6];
        return result;
      };

      let coiTypeBnf = function () {
        const result = cdataArrayBnf[6];
        return result;
      };

      let cvtypezNf = function () {
        if (clastElementNf == 'strong') {
          return (result = clastElementNf);
        } else if (clastElementNf == '') {
          return (result = c4lastNf);
        } else if (clastElementNf.includes('%')) {
          return (result = c3lastNf);
        }
      };

      let cvtypezBnf = function () {
        if (clastElementBnf == 'strong') {
          return (result = clastElementBnf);
        } else if (clastElementBnf == '') {
          return (result = c4lastBnf);
        } else if (clastElementBnf.includes('%')) {
          return (result = c3lastBnf);
        }
      };

      let pvPercentNf = function () {
        const result =
          //   pdataArrayNf[7] == '-' ? pdataArrayNf[8] : pdataArrayNf[6];
          // return result == 'strong' ? 100 : Number(result.replace('%', ''));
          pdataArrayNf[7] == '-' ? pdataArrayNf[8] : pdataArrayNf[6];
        return result == 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let pvPercentBnf = function () {
        const result =
          //   pdataArrayNf[7] == '-' ? pdataArrayNf[8] : pdataArrayNf[6];
          // return result == 'strong' ? 100 : Number(result.replace('%', ''));
          pdataArrayBnf[7] == '-' ? pdataArrayBnf[8] : pdataArrayBnf[6];
        return result == 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let poiPercNf = function () {
        if (typeof plastElementNf === 'undefined') return;

        let result = plastElementNf;
        if (result === '') result = pdataArrayNf[pdataArrayNf.length - 2];
        if (typeof result !== 'string') return;
        return result === 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let poiPercBnf = function () {
        if (typeof plastElementBnf === 'undefined') return;

        let result = plastElementBnf;
        if (result === '') result = pdataArrayBnf[pdataArrayBnf.length - 2];
        if (typeof result !== 'string') return;
        return result === 'strong' ? 100 : Number(result.replace('%', ''));
      };

      let pTypeNf = function () {
        const result = pdataArrayNf[3]; // //pTypeNf         //12
        return result;
      };

      let pTypeBnf = function () {
        const result = pdataArrayBnf[3]; // //pTypeNf         //12
        return result;
      };

      let PoINf = function () {
        if (plastElementNf == 'strong') {
          return (result = p3lastNf);
        } else if (plastElementNf == '') {
          return (result = p6lastNf);
        } else if (plastElementNf.includes('%')) {
          return (result = p5lastNf);
        }
      };

      let PoIBnf = function () {
        if (plastElementBnf == 'strong') {
          return (result = p3lastBnf);
        } else if (plastElementBnf == '') {
          return (result = p6lastBnf);
        } else if (plastElementBnf.includes('%')) {
          return (result = p5lastBnf);
        }
      };

      let poiTypeNf = function () {
        if (plastElementNf == 'strong') {
          return (result = plastElementNf);
        } else if (plastElementNf == '') {
          return (result = p4lastNf);
        } else if (plastElementNf.includes('%')) {
          return (result = p3lastNf);
        }
      };

      let poiTypeBnf = function () {
        if (plastElementBnf == 'strong') {
          return (result = plastElementBnf);
        } else if (plastElementBnf == '') {
          return (result = p4lastBnf);
        } else if (plastElementBnf.includes('%')) {
          return (result = p3lastBnf);
        }
      };

      const _id = `${dd}/${mm}/${yyyy}/${timeStampNf}`;

      const recordNf = [
        // cdataArrayNf[0], // call label 1
        cdataArrayNf[1], //cResistance 1
        cTypeNf(), //cType 2
        cdataArrayNf[4], // cOI STATIC  3
        coiTypeNf(), //  coiType                4
        coiPercentNf(), // coiPerc                  5
        cVolumeNf(), // cVolumeNf       STATIC        6
        cvtypezNf(), // cvtype   7
        cvPercentNf(), // cvPercent   8

        timeStampNf, //   'TIMESTAMP'  9
        valuesNf.spotVal, // pending from here 10,

        pdataArrayNf[1], // STATIC pSupport 11
        pTypeNf(), // pType         //12
        pdataArrayNf[4], //  'pV'   //15
        pdataArrayNf[6], //   pvType' 16
        pvPercentNf(), // 'pvPercentage' // 17
        PoINf(), // pOI STATIC // 13
        poiTypeNf(),
        poiPercNf(), // 'poiPerc'  // 14
      ];
      const recordBnf = [
        // cdataArrayNf[0], // call label 1
        cdataArrayBnf[1], //cResistance 1
        cTypeBnf(), //cType 2
        cdataArrayBnf[4], // cOI STATIC  3
        coiTypeBnf(), //  coiType                4
        coiPercentBnf(), // coiPerc                  5
        cVolumeBnf(), // cVolumeNf       STATIC        6
        cvtypezBnf(), // cvtype   7
        cvPercentBnf(), // cvPercent   8

        timeStampBnf, //   'TIMESTAMP'  9
        valuesBnf.spotVal, // pending from here 10,

        pdataArrayBnf[1], // STATIC pSupport 11
        pTypeBnf(), // pType         //12
        pdataArrayBnf[4], //  'pV'   //15
        pdataArrayBnf[6], //   pvType' 16
        pvPercentBnf(), // 'pvPercentage' // 17
        PoIBnf(), // pOI STATIC // 13
        poiTypeBnf(),
        poiPercBnf(), // 'poiPerc'  // 14
      ];

      const recordNfmo = [
        {
          cResistance: cdataArrayNf[1],
          cType: cTypeNf(),
          cOI: cdataArrayNf[4],
          coiType: coiTypeNf(),
          coiPerc: coiPercentNf(),
          cV: cdataArrayNf[7] == '-' ? cdataArrayNf[9] : cdataArrayNf[7],
          cvType: cvtypezNf(), //   7
          cvPercent: cvPercentNf(), //   8
          Time: timeStampNf, //   'TIMESTAMP'  9
          spotPrice: valuesNf.spotVal, // spotVal 10,
          pSupport: pdataArrayNf[1],
          pType: pTypeNf(),
          pOI: PoINf(),
          poiType: poiTypeNf(),
          poiPerc: poiPercNf(),
          pV: pdataArrayNf[4],
          pvType: pdataArrayNf[6],
          pvPercent: pvPercentNf(),
        },
      ];

      // const documents = recordNfmo.map((record) => ({ data: record }));
      const documents = recordNfmo.map((record) => ({ _id, data: record }));

      // const documents = { data: recordNf };

      csvWriterNf.writeRecords([recordNf]).then(() => {
        console.log('Done');
      });
      csvWriterBnf.writeRecords([recordBnf]).then(() => {
        console.log('Done');
      });
      try {
        const result = await collection.insertMany(documents);
        // console.log('Documents inserted');
      } catch (err) {
        console.log(err);
      }
      console.log(cdataArrayNf);
      console.log(pdataArrayNf);

      async function randRefresh() {
        if (Math.random() < 0.1) {
          await pageNf.click('#btn-filter');
          await pageBnF.click('#btn-filter');
          console.log('btn was clicked');
        }
        return Promise.resolve();
      }
      await randRefresh();
      console.log(timeStampNf);
    }, 60000); // Call the function every 1 minute (60000 milliseconds)
  } catch (error) {
    console.log(error);
  }
})();
