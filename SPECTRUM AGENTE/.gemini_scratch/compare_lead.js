const fs = require('fs');

const file1 = process.argv[2];
const file2 = process.argv[3];

const d1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
const d2 = JSON.parse(fs.readFileSync(file2, 'utf8'));

const nodes1 = {};
d1.nodes.forEach(n => nodes1[n.name] = n);

const nodes2 = {};
d2.nodes.forEach(n => nodes2[n.name] = n);

console.log(`Comparing ${file1} (USER) vs ${file2} (LOCAL)`);

for (const name of Object.keys(nodes1)) {
    if (!nodes2[name]) {
        console.log(`Node '${name}' is in USER but missing in LOCAL`);
        continue;
    }
    const n1 = nodes1[name];
    const n2 = nodes2[name];
    
    // Compare parameters
    const param1Str = JSON.stringify(n1.parameters);
    const param2Str = JSON.stringify(n2.parameters);
    
    if (param1Str !== param2Str) {
        console.log(`\nDifferences in node: ${name}`);
        console.log(`USER parameters:`);
        console.log(JSON.stringify(n1.parameters, null, 2));
        console.log(`LOCAL parameters:`);
        console.log(JSON.stringify(n2.parameters, null, 2));
    }
}

for (const name of Object.keys(nodes2)) {
    if (!nodes1[name]) {
        console.log(`Node '${name}' is in LOCAL but missing in USER`);
    }
}
