const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/shelters-detail.json'), 'utf8'));

const PROV = {
    '\u062a\u0647\u0631\u0627\u0646': 'Tehran',
    '\u0645\u0627\u0632\u0646\u062f\u0631\u0627\u0646': 'Mazandaran',
    '\u0627\u0644\u0628\u0631\u0632': 'Alborz',
    '\u06af\u06cc\u0644\u0627\u0646': 'Gilan',
    '\u0642\u0632\u0648\u06cc\u0646': 'Qazvin',
    '\u0627\u0635\u0641\u0647\u0627\u0646': 'Isfahan',
    '\u0627\u0631\u062f\u0628\u06cc\u0644': 'Ardabil',
    '\u0622\u0630\u0631\u0628\u0627\u06cc\u062c\u0627\u0646 \u0634\u0631\u0642\u06cc': 'East Azerbaijan',
    '\u0686\u0647\u0627\u0631\u0645\u062d\u0627\u0644 \u0648 \u0628\u062e\u062a\u06cc\u0627\u0631\u06cc': 'Chaharmahal & Bakhtiari',
    '\u06a9\u0647\u06af\u06cc\u0644\u0648\u06cc\u0647 \u0648 \u0628\u0648\u06cc\u0631\u0627\u062d\u0645\u062f': 'Kohgiluyeh & Boyer-Ahmad',
    '\u0644\u0631\u0633\u062a\u0627\u0646': 'Lorestan',
    '\u0647\u0645\u062f\u0627\u0646': 'Hamedan',
    '\u06a9\u0631\u0645\u0627\u0646\u0634\u0627\u0647': 'Kermanshah',
    '\u06a9\u0631\u062f\u0633\u062a\u0627\u0646': 'Kurdistan',
    '\u0641\u0627\u0631\u0633': 'Fars',
    '\u06cc\u0632\u062f': 'Yazd',
    '\u062e\u0631\u0627\u0633\u0627\u0646 \u0631\u0636\u0648\u06cc': 'Khorasan Razavi',
    '\u06af\u0644\u0633\u062a\u0627\u0646': 'Golestan'
};

const MANUAL = {
    '\u067e\u0646\u0627\u0647\u06af\u0627\u0647 \u0633\u0631\u0686\u0627\u0644': {
        name: 'Sarchal Shelter',
        description: 'One of the busiest shelters in Central Alborz and the main gateway to northern Tehran peaks.',
        history: 'Built in the 1970s by the Mountaineering Federation and renovated several times since.'
    },
    '\u067e\u0646\u0627\u0647\u06af\u0627\u0647 \u062a\u0648\u0686\u0627\u0644': {
        name: 'Tochal Shelter',
        description: 'At 3,900 m, the nearest fully equipped shelter to Tehran; reachable via the Tochal telecabin.',
        history: 'Built in the 1980s and expanded over the years; capacity 120 makes it the largest hut near the capital.'
    },
    '\u067e\u0646\u0627\u0647\u06af\u0627\u0647 \u0634\u06cc\u0631\u067e\u0644\u0627': {
        name: 'Shirpala Shelter',
        description: 'On the popular northern Tehran valleys route; a rest stop on the Sarchal\u2013Tochal traverse.',
        history: 'One of the oldest Central Alborz shelters, built in the 1960s by Tehran climbing clubs.'
    },
    '\u067e\u0646\u0627\u0647\u06af\u0627\u0647 \u062f\u0645\u0627\u0648\u0646\u062f (\u06af\u0648\u0633\u0641\u0646\u062f\u0633\u0631\u0627)': {
        name: 'Damavand Goatfold Shelter',
        description: 'Main southern Damavand base camp at Gosfandsara; full facilities including meals and lodging.',
        history: 'The oldest and best-known Damavand shelter since the 1960s; major renovation in the 2000s.'
    },
    '\u067e\u0646\u0627\u0647\u06af\u0627\u0647 \u0628\u0631\u06af\u0627\u0647 \u062f\u0645\u0627\u0648\u0646\u062f': {
        name: 'Damavand Bargah-e Sevom',
        description: 'Third camp at 4,220 m \u2014 last equipped shelter before the Damavand summit on the south route.',
        history: 'Built in the 1980s; recently equipped with solar panels.'
    }
};

function autoName(s) {
    let n = s.name;
    if (n.indexOf('\u067e\u0646\u0627\u0647\u06af\u0627\u0647 ') === 0) return n.replace('\u067e\u0646\u0627\u0647\u06af\u0627\u0647 ', '') + ' Shelter';
    if (n.indexOf('\u062c\u0627\u0646\u067e\u0646\u0627\u0647 ') === 0) return n.replace('\u062c\u0627\u0646\u067e\u0646\u0627\u0647 ', '') + ' Bivouac';
    if (n.indexOf('\u06a9\u0644\u0628\u0647 ') === 0) return n.replace('\u06a9\u0644\u0628\u0647 ', '') + ' Cabin';
    return n;
}

function autoDesc(s) {
    const p = PROV[s.province] || s.province;
    const kind = s.type === '\u062c\u0627\u0646\u067e\u0646\u0627\u0647' ? 'bivouac' : s.type === '\u06a9\u0644\u0628\u0647' ? 'cabin' : 'shelter';
    return 'Mountain ' + kind + ' in ' + p + (s.altitude ? ' at ' + s.altitude + ' m.' : '.');
}

const out = {};
items.forEach(function (s) {
    const m = MANUAL[s.name];
    out[s.name] = {
        name: m ? m.name : autoName(s),
        province: PROV[s.province] || s.province,
        description: m ? m.description : autoDesc(s),
        history: m && m.history ? m.history : (s.history ? autoDesc(s) : null)
    };
});

fs.writeFileSync(path.join(ROOT, 'data/shelters-en.json'), JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote', Object.keys(out).length, 'entries to data/shelters-en.json');
