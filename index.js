import fs from 'fs/promises';
import fsSync from 'fs';
import { Spinner } from '@topcli/spinner';

import 'colors';

//laziness
async function DownloadText(url) {
    return await fetch(url).then(data=>data.text());
}

const topPackages = [];

async function GetTopJSDelivrPackages() {
    const spinner = new Spinner().start("Getting top JSDelivr Packages..");

    //i think i finally learned for statements fhsdafdsafhi
    for (let i = 0; i < 30; i++) {
        spinner.text = `Getting top JSDelivr Packages.. ${i + 1}/30`;
    
        const response = await fetch(`https://data.jsdelivr.com/v1/stats/packages?limit=100&page=${i + 1}`).then(data => data.json());
    
        response.forEach(pkg => {
            if (pkg.type === "npm") {
                topPackages.push(pkg.name);
            }
        });
    }

    spinner.succeed(`Got ${topPackages.length} package names!`);
};

async function DownloadJSDelivrPackages() {
    //create dist directory if it doesnt exist already
    if (!fsSync.existsSync("./dist/")) {
        await fs.mkdir("./dist/");
    }

    const spinner = new Spinner().start("Starting to download packages..");

    //how to kill ur computer
    let i = 0;
    for (let _pkg of topPackages) {
        spinner.text = `Downloading package ${i + 1}/${topPackages.length}..`;

        /**
         * @type {string}
         */
        let pkg = _pkg;

        const received = await DownloadText(`https://cdn.jsdelivr.net/npm/${pkg}`);

        await fs.writeFile(`./dist/${pkg.replace("/", ".")}.js`, received);
        i++;
    }

    //rare chance of this actually happening
    spinner.succeed('Downloaded all packages successfully!');
}

async function CreateWebsite() {
    //copys the website files into dist
    const spinner = new Spinner().start("Creating website..");
    if (!fsSync.existsSync("./website/")) {
        await fs.mkdir("./website/");
        //download the website files from the already available dumocdn instance
        spinner.text = 'Downloading website files..';
        const html = await DownloadText("https://javascript.dumorando.com/index.html");
        const css = await DownloadText("https://javascript.dumorando.com/styles.css");
        const js = await DownloadText("https://javascript.dumorando.com/NOTAPACKAGEwebsite.js");
        //now save em
        spinner.text = 'Saving website files..';
        await fs.writeFile('./website/index.html', html);
        await fs.writeFile('./website/styles.css', css);
        await fs.writeFile('./website/NOTAPACKAGEwebsite.js', js);
    };
    spinner.text = 'Copying website files..';
    const wwwfiles = await fs.readdir('./website/');
    //this one doesnt matter if its all happening at once
    await Promise.all(wwwfiles.map(async file => {
        let filecontent = await fs.readFile(`./website/${file}`, 'utf-8');
        await fs.writeFile(`./dist/${file}`, filecontent);
    }));
    //make packages.json
    await fs.writeFile('./dist/packages.json', JSON.stringify(topPackages));
    spinner.succeed('Finished creating website!');
}

//run hte functions
await GetTopJSDelivrPackages();
await DownloadJSDelivrPackages();
await CreateWebsite();

console.log('Finished!'.green);