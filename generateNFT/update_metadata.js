const basePath = process.cwd();
const fs = require("fs");
let counter = 1;
console.log(basePath)
const namePrefix = "BBB";
const description = "bbbbbbb";
const baseUri = "ipfs://aaAAbbBBBBaa";

// read json data
let rawdata = fs.readFileSync(`${basePath}/data/_metadata.json`);
let data = JSON.parse(rawdata);

data.forEach((item) => {
    item.name = `${namePrefix}`;
    item.description = description;
    item.image = `${baseUri}/.png`;
  fs.writeFileSync(
    `${basePath}/data/${counter}`,
    JSON.stringify(item, null, 2)
  );
  counter++;
});

fs.writeFileSync(
  `${basePath}/data/_metadata.json`,
  JSON.stringify(data, null, 2)
);

  console.log(`Updated baseUri for images to ===> ${baseUri}`);
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);

