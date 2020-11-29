const howToUse = `
 * How to run script:
 * ==================
 * If you want run this script You only need some params and hit enter ;)
 *
 * Param list:
 * ===========
 * // The domain you have
 * domain=something.com
 * 
 * // Isp Manager username
 * user=username
 * 
 * // Isp Manager password
 * pass=password
 * 
 * // The subdomain you want to set/or create
 * // (the full url will be awesome.something.com)
 * subdomain=awesome
 * 
 * // Your hosting Isp Manager login url
 * // For example the full Isp Manager url is https://some-hosting.com/ispmgr
 * // the "some-hosting.com" will be the param
 * hostname=some-hosting.com
 * 
 * // The path where the Isp Manager is runing
 * // For example the full Isp Manager url is https://some-hosting.com/ispmgr
 * // the "ispmgr" will be the param
 * isp-mgr-path=ispmgr
 * 
 * // OPTIONAL! If you don't set this param your ISP IP will be used
 * ip=192.168.1.1
 * 
 *
 * Example:
 * ========
 * node index.js domain=something.com user=username pass=password subdomain=awesome hostname=some-hosting.com isp-mgr-path=ispmgr ip=192.168.1.1
 * 
 * node index.js domain=something.com user=username pass=password subdomain=awesome hostname=some-hosting.com isp-mgr-path=ispmgr`;

const https = require("https");
const querystring = require("querystring");

const setData = async () => {
  const options = process.argv.reduce((acc, option) => {
    const [optionKey, ...optionValue] = option.split("=");
    acc[optionKey] = optionValue.join("=");
    return acc;
  }, {});

  if (
    !options.domain ||
    !options.user ||
    !options.pass ||
    !options.subdomain ||
    !options.hostname ||
    !options["isp-mgr-path"]
  ) {
    console.log(`ERROR! MISSING PARAMTERS!\n${howToUse}`);
    return;
  }

  const domain = options.domain;
  const username = options.user;
  const password = options.pass;
  const subdomain = options.subdomain;
  const ispMgrHostname = options.hostname;
  const ispMgrPath = options["isp-mgr-path"];
  const ispMgrUrl = `https://${ispMgrHostname}/${ispMgrPath}`;
  const dnsName = `${subdomain}.${domain}.`;
  const networkData = options.ip
    ? `ip=${options.ip}`
    : await new Promise((resolve) => {
        https.get("https://www.cloudflare.com/cdn-cgi/trace", (res) => {
          let body = "";
          res.on("data", (data) => (body += data));
          res.on("end", () => resolve(body));
        });
      });
  const dnsRecordData = await new Promise((resolve) => {
    https.get(
      `${ispMgrUrl}?authinfo=${username}:${password}&elid=${domain}&func=domain.record`,
      (res) => {
        let body = "";
        res.on("data", (data) => (body += data));
        res.on("end", () => resolve(JSON.parse(body.replace("\\'", ""))));
      }
    );
  });

  const postData = querystring.stringify({
    authinfo: `${username}:${password}`,
    func: "domain.record.edit",
    elid:
      dnsRecordData.content.find((record) => record.name.v === dnsName)?.rkey
        ?.v ?? "",
    plid: domain,
    name: dnsName,
    ttl: 3600,
    rtype: "a",
    ip: networkData.match(/ip=(.*)/)?.[1] ?? "",
    sok: "ok",
  });

  const postOptions = {
    hostname: ispMgrHostname,
    port: 443,
    path: `/${ispMgrPath}`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
    },
  };

  const isPostSuccess = await new Promise((resolve) => {
    const req = https.request(postOptions, (res) =>
      resolve(res.statusCode === 200)
    );
    req.on("error", () => resolve(false));
    req.write(postData);
    req.end();
  });

  console.log(
    `${Date()}\nIs isp domain "A" record set was successful: ${isPostSuccess}\n`
  );
};

setData();
