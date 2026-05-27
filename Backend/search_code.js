const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
};

const search = () => {
    const root = path.resolve(__dirname, '..'); // FYP-WEB root
    console.log('Searching under root:', root);
    const files = walk(root);
    let found = 0;
    files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.toLowerCase().includes('matches id')) {
            console.log(`Found in: ${file}`);
            found++;
        }
    });
    console.log(`Search completed. Found ${found} occurrences.`);
};

search();
