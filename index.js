const fs = require("fs");
const puppeteer = require("puppeteer");
const { glob } = require("glob");

const PAGES_PATH = "reports";
const OUTPUT_PATH = "pdfs";

if (
  !fs.existsSync(`${__dirname}/${PAGES_PATH}`) ||
  fs.readdirSync(`${__dirname}/${PAGES_PATH}`) === 0
) {
  console.log("> Default page(s) directory not found or empty");
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const files = await glob(`./${PAGES_PATH}/**/lighthouse.html`);

  console.log("> Process has been started")

  for (const file of files) {
    const name = file.split("/").reverse()[1];
    const url = `file://${__dirname}/${file}`;

    console.log(`\nStarting: /${name}/`);

    if (!fs.existsSync(`${__dirname}/${OUTPUT_PATH}/${name}`)) {
      fs.mkdirSync(`${__dirname}/${OUTPUT_PATH}/${name}`, {
        recursive: true,
      });
    }

    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1920 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.pdf({ path: `./${OUTPUT_PATH}/${name}/SUMMARY-${name}.pdf` });
    console.log(`Success: SUMMARY-${name}.pdf`);

    await page.$$eval("details", (elements) =>
      elements.forEach((element) => element.setAttribute("open", ""))
    );

    await page.pdf({
      path: `./${OUTPUT_PATH}/${name}/DETAILS-${name}.pdf`,
    });
    console.log(`Success: DETAILS-${name}.pdf`);
  }
  await page.close();
  await browser.close();
  console.log("\n> Files generated with success!")
})();
