const axios = require('axios');


async function handleReCaptcha(page) {
  const captchaSiteKey = await page.getAttribute('.g-recaptcha', 'data-sitekey');
  const pageUrl = page.url();

  if (!captchaSiteKey) {
    throw new Error('ReCaptcha site key not found.');
  }

  console.log('Requesting ReCaptcha solution from 2Captcha...');

  try {
    const response = await axios.post(
      `https://2captcha.com/in.php`,
      null,
      {
        params: {
          key: process.env.TWOCAPTCHA_API_KEY,
          method: 'userrecaptcha',
          googlekey: captchaSiteKey,
          pageurl: pageUrl,
          json: 1,
        },
      }
    );

    if (response.data.request === 'ERROR_ZERO_BALANCE') {
      console.warn('2Captcha account has insufficient balance. Falling back to manual solution.');
      console.log('Please solve the ReCaptcha manually.');
      await page.waitForTimeout(30000); // Allow 30 seconds for manual solving
      return;
    }

    const captchaId = response.data.request;
    console.log(`Captcha ID: ${captchaId}. Waiting for solution...`);

    let solution;
    let attempts = 0;
    while (!solution && attempts < 12) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const result = await axios.get(`https://2captcha.com/res.php`, {
        params: {
          key: process.env.TWOCAPTCHA_API_KEY,
          action: 'get',
          id: captchaId,
          json: 1,
        },
      });

      if (result.data.status === 1) {
        solution = result.data.request;
      }

      attempts++;
    }

    if (!solution) {
      throw new Error('Timed out waiting for ReCaptcha solution.');
    }

    console.log('ReCaptcha solved. Inserting token into the page...');
    await page.evaluate((token) => {
      document.querySelector('#g-recaptcha-response').value = token;
    }, solution);

  } catch (error) {
    console.error('ReCaptcha automation failed:', error.message);
    console.log('Please solve the ReCaptcha manually.');
    await page.waitForTimeout(30000); // Allow manual solving
  }
}


module.exports = { handleReCaptcha };