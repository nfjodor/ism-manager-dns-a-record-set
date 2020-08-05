## How to run script
If you want run this script You only need some params and hit enter ;)

### Param list
```
domain=something.com // the domain you have
user=username // Isp Manager username
pass=password // Isp Manager password
subdomain=awesome // the subdomain you want to set/or create (the full url will be awesome.something.com)
hostname=some-hosting.com // your hosting Isp Manager login url (for example the full Isp Manager url is https://some-hosting.com/ispmgr the "some-hosting.com" will be the param)
isp-mgr-path=ispmgr // the path where the Isp Manager is runing (for example the full Isp Manager url is https://some-hosting.com/ispmgr the "ispmgr" will be the param)
ip=192.168.1.1 // optional if you don't set this param your ISP IP will be used
```
Example
```
node index.js domain=something.com user=username pass=password subdomain=awesome hostname=some-hosting.com isp-mgr-path=ispmgr ip=192.168.1.1
```
```
node index.js domain=something.com user=username pass=password subdomain=awesome hostname=some-hosting.com isp-mgr-path=ispmgr
```
