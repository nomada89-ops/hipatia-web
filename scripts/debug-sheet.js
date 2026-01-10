
const Papa = require('papaparse');

const SHEET_ID = '1dHWNQg0w6GfZoMO4qTZFc-GGm-bZqO9bZ08Fv7LCWR8';
const SHEET_NAME = 'Detalle Inversores';
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

async function testFetch() {
    console.log('Fetching:', URL);
    try {
        const res = await fetch(URL);
        const text = await res.text();
        // console.log('Raw text sample:', text.substring(0, 500));

        const parsed = Papa.parse(text, {
            header: true,
            dynamicTyping: true
        });

        if (parsed.data.length > 0) {
            console.log('Found columns:', Object.keys(parsed.data[0]));
            console.log('First row example:', parsed.data[0]);
        } else {
            console.log('No data found or parsed improperly.');
        }

    } catch (e) {
        console.error(e);
    }
}

testFetch();
