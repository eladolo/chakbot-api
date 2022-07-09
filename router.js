const fs = require('fs');

fs.readdirSync(`${__dirname}/modules`)
.filter(file => (file.slice(-3) === '.js'))
.forEach((file) => {
    let name = file.split(".");
    name = name[0];
    exports[name] = require(`./modules/${file}`);
});