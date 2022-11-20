const webdriver = require('selenium-webdriver');
const { Builder, By, until} = webdriver;
const capabilities = require('./capabilities.json');
require("chromedriver");

const chai = require("chai");
const expect = chai.expect;
chai.config.showDiff = true;

const HatUrl = 'https://row.lyleandscott.com/products/racked-rib-beanie-true-black';
const serverUrl = 'http://bsuser_ZvQmut:TGaiaS6ezp6ikhQT3TWD@hub-cloud.browserstack.com/wd/hub';
const itemAddedToBagText = 'Item added to bag';
const acceptCookiesButtonCssSelector = 'button#onetrust-accept-btn-handler';
const hatTitleOnHatPageCssSelector = 'h1.main-product__title';
const hatSizeXpathSelector = '//div[@class="size-selector__content"]/div[text()=\'1SZ\']';
const hatPriceOnHatPageCssSelector = 'span.main-product__price';
const addToBagButtonCssSelector = 'button.product-form__add-to-cart';
const addedToBagPopupCssSelector = 'div.cart-upsell-overlay';
const divWithItemAddedToBagTextCssSelector = 'div.cart-upsell__notification p';
const viewBagButtonXpathSelector = '//div[@class=\'cart-upsell__header\']//child::a[@class=\'button cart-upsell__button\']';
const itemsInBagXpathSelector = '//div[@class=\'main-cart__line-items\']/child::div';
const hatTitleInTHeBagCssSelector = 'a.main-cart__line-item-title';
const numberOfItemsInBagCssSelector = 'p.cart-summary__count';
const totalPriceInTheBagCssSelector = 'h2.cart-summary__title';

describe("Add a Hat to the Bag test", () => {
  it('Should add a Hat to the Bag', async function () {
    let driver = new webdriver.Builder()
        .usingServer(serverUrl)
        .withCapabilities({
          ...capabilities,
          ...capabilities['browser'] && { browserName: capabilities['browser']}  // Because NodeJS language binding requires browserName to be defined
        })
        .build();

    await driver.get(HatUrl);
    await driver.manage().window().maximize();

    //closing all popups
    await driver.wait(until.elementLocated(By.css(acceptCookiesButtonCssSelector)), 5000);
    await driver.findElement(By.css(acceptCookiesButtonCssSelector)).click();

    //hat page
    const hatPriceOnHatPage = await driver.findElement(By.css(hatPriceOnHatPageCssSelector)).getText();
    const hatTitleOnHatPage = await driver.findElement(By.css(hatTitleOnHatPageCssSelector)).getText();

    await driver.wait(until.elementLocated(By.xpath(hatSizeXpathSelector)), 5000);
    await driver.findElement(By.xpath(hatSizeXpathSelector)).click();

    await driver.wait(until.elementLocated(By.css(addToBagButtonCssSelector)), 5000);
    await driver.findElement(By.css(addToBagButtonCssSelector)).click();

    const addedToBagPopup = await driver.findElement(By.css(addedToBagPopupCssSelector));
    await driver.wait(until.elementIsVisible(addedToBagPopup), 5000);
    const textFromAddedToBagPopup = await driver.findElement(By.css(divWithItemAddedToBagTextCssSelector)).getText();

    await driver.findElement(By.xpath(viewBagButtonXpathSelector)).click();

    //bag page
    await driver.wait(until.elementLocated(By.xpath(itemsInBagXpathSelector)), 5000);
    const itemsInBag = await driver.findElements(By.xpath(itemsInBagXpathSelector));
    const numberOfItemsInBagFromList = itemsInBag.length;
    const hatTitleOnBagPage = await driver.findElement(By.css(hatTitleInTHeBagCssSelector)).getText();
    let numberOfItemsInBagFromTotal = await driver.findElement(By.css(numberOfItemsInBagCssSelector)).getText();
    numberOfItemsInBagFromTotal = parseInt(numberOfItemsInBagFromTotal.match(/\d+/));
    const totalPriceInTheBag = await driver.findElement(By.css(totalPriceInTheBagCssSelector)).getText();

    await driver.quit();

    expect(hatPriceOnHatPage).to.equal(totalPriceInTheBag);
    expect(hatTitleOnHatPage).to.equal(hatTitleOnBagPage);
    expect(numberOfItemsInBagFromList).to.equal(numberOfItemsInBagFromTotal);
    expect(textFromAddedToBagPopup).to.equal(itemAddedToBagText);
  }).timeout(60000);
});