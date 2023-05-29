const axios = require('axios');
var HTMLParser = require('node-html-parser');
const JsonFind = require("json-find");
const sgMail = require('@sendgrid/mail');


getDocs();
let prev = '';
async function getDocs(){
    //console.log("Creating Promise Array");
    while(true) {
        let promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(axios.get('https://www.bestbuy.com/site/computer-cards-components/video-graphics-cards/abcat0507002.c?cp='+ i +'&id=abcat0507002&qp=gpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%205500%20XT%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%205600%20XT%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%205700%20XT%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%206800%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%206800%20XT%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%206900%20XT%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%202060%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%202080%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203060%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203060%20Ti%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203070%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203080%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203090&sp=-currentprice%20skuidsaas'));
        }
        await resolvePromises(promises);
    }


}


async function resolvePromises(promises){
    await Promise.allSettled(promises).then(await function(values) {

        let getProm = [];
        for(let value of values){
            //console.log(value);
            if(value.status === "fulfilled") {
                const root = HTMLParser.parse(value.value.data);
                root.querySelectorAll('.sku-item').forEach((item) =>{
                    let key = item.getAttribute('data-sku-id');
                    getProm.push(axios.get('https://www.bestbuy.com/api/tcfb/model.json?paths=%5B%5B%22shop%22%2C%22magellan%22%2C%22v2%22%2C%22storeId%22%2C%22stores%22%2C1189%2C%5B%22status%22%2C%22storeType%22%5D%5D%2C%5B%22shop%22%2C%22magellan%22%2C%22v2%22%2C%22product%22%2C%22skus%22%2C' + key + '%2C%22descriptions%22%2C%5B%22long%22%2C%22shortSynopsis%22%5D%5D%2C%5B%22shop%22%2C%22magellan%22%2C%22v2%22%2C%22product%22%2C%22skus%22%2C' + key + '%2C%22images%22%2C%220%22%5D%2C%5B%22shop%22%2C%22magellan%22%2C%22v2%22%2C%22product%22%2C%22skus%22%2C' + key + '%2C%22names%22%2C%22short%22%5D%2C%5B%22shop%22%2C%22magellan%22%2C%22v1%22%2C%22sites%22%2C%22skuId%22%2C' + key + '%2C%22sites%22%2C%22bbypres%22%2C%22relativePdpUrl%22%5D%2C%5B%22shop%22%2C%22magellan%22%2C%22v2%22%2C%22product%22%2C%22skus%22%2C' + key + '%2C%5B%22seasonDetails%22%2C%22videoDetails%22%5D%2C0%2C%22synopsis%22%5D%2C%5B%22shop%22%2C%22buttonstate%22%2C%22v5%22%2C%22item%22%2C%22skus%22%2C' + key + '%2C%22conditions%22%2C%22NONE%22%2C%22destinationZipCode%22%2C85233%2C%22storeId%22%2C1189%2C%22context%22%2C%22cyp%22%2C%22addAll%22%2C%22false%22%5D%2C%5B%22shop%22%2C%22recommendations%22%2C%22api%22%2C%22list%22%2C%22srcs%22%2C%22dotcom-l%22%2C%22skuIds%22%2C' + key + '%2C%22plmts%22%2C%22cyp%22%2C%22pageSizes%22%2C10%2C%22apiKeys%22%2C%22D50%22%2C%22cyp%22%2C%22ep%22%5D%2C%5B%22shop%22%2C%22recommendations%22%2C%22api%22%2C%22list%22%2C%22srcs%22%2C%22dotcom-l%22%2C%22skuIds%22%2C' + key + '%2C%22plmts%22%2C%22cyp%22%2C%22pageSizes%22%2C10%2C%22apiKeys%22%2C%22D50%22%2C%22cyp%22%2C%22_entries%22%2C%7B%22from%22%3A0%2C%22to%22%3A9%7D%2C%5B%22ep%22%2C%22id%22%2C%22rank%22%5D%5D%5D&method=get'));
                });
            }
        }

        return resolveCards(getProm);

    });
}


async function resolveCards(cards){
    let inStock = '';
    let blackListed = []// ['6453897'];
    await Promise.allSettled(cards).then(await function(values) {
        console.log("Checking: " + new Date().toLocaleString());

        for(let value of values){
            if(value.status === "fulfilled") {
                const doc = JsonFind(value.value.data['jsonGraph'])
                //console.log(doc.checkKey('displayText'));
                if(doc.checkKey('displayText') === 'Add to Cart'){// && !blackListed.includes(doc.checkKey('buttonStateResponseInfos')[0].skuId)) {
                    console.log(doc.checkKey('names').short.value);
                    console.log('https://www.bestbuy.com' + doc.checkKey('relativePdpUrl').value);
                    console.log(doc.checkKey('displayText'));
                    console.log("In Stock");
                    console.log();
                    //console.log(doc.checkKey('buttonStateResponseInfos')[0].skuId);
                    //inStock+='<tr style="height: 21px;"><td style="width: 25%; height: 21px;">'+ 'https://api.bestbuy.com/click/-/' + doc.checkKey('buttonStateResponseInfos')[0].skuId +'/cart/</td><td style="width: 25%; height: 21px;">'+ 'https://www.bestbuy.com' + doc.checkKey('relativePdpUrl').value +'</td><td style="width: 25%; height: 21px;">'+ doc.checkKey('names').short.value +'</td></tr>';
                }
            }
        }
    });
  
    if(inStock.length > 0 && inStock !== prev) await sendEmail(inStock);
}


async function sendEmail(gpus) {
    sgMail.setApiKey('API_KEY');
    const msg = {
        to: 'email@example.com',
        from: 'email@example.com', // Use the email address or domain you verified above
        subject: 'NEW GPU IN STOCK',
        text: 'NEW GPU IN STOCK',
        html: '<p>New GPU\'s in Stock:</p>\n' +
            '<table border="1" style="border-collapse: collapse; width: 100%; height: 42px;">\n' +
            '<tbody>\n' +
            '<tr style="height: 21px;">\n' +
            '<td style="width: 25%; height: 21px;">Add to Cart Link</td>\n' +
            '<td style="width: 25%; height: 21px;">Link</td>\n' +
            '<td style="width: 25%; height: 21px;">Title</td>\n' +
            '</tr>\n' + gpus +
            '</tbody>\n' +
            '</table>',
    };

    try {
        await sgMail.send(msg);
        prev = gpus;
    } catch (error) {
        console.error(error);

        if (error.response) {
            console.error(error.response.body)
        }
    }

}
