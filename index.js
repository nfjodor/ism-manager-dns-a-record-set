const https = require('https');
const querystring = require('querystring');

const setData = async () => {
  const options = process.argv.reduce((acc, option) => {
    const optionArray = option.split('=');
    acc[optionArray[0]] = optionArray[1];
    return acc;
  }, {});

  const domain = options.domain;
  const username = options.user;
  const password = options.pass;
  const subdomain = options.subdomain;
  const ispMgrHostname = options.hostname;
  const ispMgrPath = options['isp-mgr-path'];
  const ispMgrUrl = `https://${ispMgrHostname}/${ispMgrPath}`;
  const dnsName = `${subdomain}.${domain}.`;
  const networkData = options.ip ? `ip=${options.ip}` : await new Promise(resolve => {
    https.get('https://www.cloudflare.com/cdn-cgi/trace', res => {
      let body = '';
      res.on('data', data => body += data);
      res.on('end', () => resolve(body));
    });
  });
  const dnsRecordData = await new Promise (resolve => {
    https.get(`${ispMgrUrl}?authinfo=${username}:${password}&elid=${domain}&func=domain.record`, res => {
      let body = '';
      res.on('data', data => body += data);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });
  const postData = querystring.stringify({
    authinfo: `${username}:${password}`,
    func: 'domain.record.edit',
    elid: dnsRecordData.content.find(record => record.name.v === dnsName)?.rkey?.v ?? '',
    plid: domain,
    name: dnsName,
    ttl: 3600,
    rtype: 'a',
    ip: networkData.match(/ip=(.*)/)?.[1] ?? '',
    sok: 'ok'
  });

  const postOptions = {
    hostname: ispMgrHostname,
    port: 443,
    path: `/${ispMgrPath}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  const isPostSuccess = await new Promise(resolve => {
    const req = https.request(postOptions, (res) => resolve(res.statusCode === 200));
    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();
  });

  console.log(`${Date()}\nIs isp domain "A" record set was successful: ${isPostSuccess}\n`);
}

setData();
