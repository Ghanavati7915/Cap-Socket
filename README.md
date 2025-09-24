
[![CAP](https://betezadi.ir/_nuxt/img/logo.12e352e.png)](https://i-cap.ir)

Manage RealTime Socket Connection Between Client/Server in CAPSocket package manager:

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Last Testing With Nuxt Version : **3.13.0**

## Sponsors
<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://bit.dev/?utm_source=pnpm&utm_medium=readme" target="_blank">
<img src="https://betezadi.ir/_nuxt/img/logo.12e352e.png" width="150" height="80" alt="Cap Logo">
</a>
      </td>
    </tr>
  </tbody>
</table>

## Background

In the past, for two-way communication between the client and the server in each project and each version in the frontend, we needed to write a large amount of code to do this communication. This process was time-consuming and also created problems for developers with different experiences. It was decided to prepare a complete package of all the company's requirements and provide it to the company's developers.

## Getting Started

-   [Installation](#installation)
-   [ExternalConfigFile](#ExternalConfigFile)
-   [Setting](#Setting)

## Installation
Installing Package To Your Project With : 
- pnpm Package Manager :
```shell
 pnpm install cap-socket latest
```
- OR npm Package Manager :
```shell
 npm install cap-socket latest
```
- OR yarn Package Manager :
```shell
 yarn add cap-socket latest
```
--------------------------------

Then, add **capSocket** to the modules section of your Nuxt configuration:
```javascript
export default defineNuxtConfig({
  modules: ['capSocket']
})
```
-------------------------------

## ExternalConfigFile
You can save the settings related to the project in a separate file outside Nuxt.Config.ts file.
For this, create a file called **cap_socket_config.json** in the **public** folder and enter the following values :
```javascript
{
    "socket": {
        "type": "signalr",
            "url": "http://192.168.100.9:3001/playgroundHub",
            "debug": true,
            "reconnectAttempts": 10,
            "reconnectDelay": 2,
            "reconnectDelayMax": 15,
            "timeout": 20
    }
}
```
The advantage of this work is that when the output from the project is prepared and placed on the server, you can change the settings related to the connection to the BackEnd without the need to prepare a new output.


## Setting
| **Key**                               | **Type**  | **Default** | **Description**                                                                                                               |
|---------------------------------------|-----------|-------------|-------------------------------------------------------------------------------------------------------------------------------|
| `type`                            | `string`  | empty       | Describe                                                                                                                      |
| `url`                       | `string`  | empty       | Describe                                               |
| `debug`                          | `boolean` | true        | Describe |
| `reconnectAttempts`                              | `number`   | 10          | Describe                                     |
| `reconnectDelay`                     | `number`  | 2           | Describe                                              |
| `reconnectDelayMax`                    | `number`  | 15          | Describe                                                 |
| `timeout`                 | `number`  | 20          | Describe                |


## Thank You
Thanks to all colleagues of [CAP Company](https://i-cap.ir)


Author : [Ahmad Ghanavati](mailto:ahmad_ghanavati.ir)








<!-- Badges -->
[npm-version-src]: https://www.npmjs.com/package/cap-socket/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://www.npmjs.com/package/cap-socket

[npm-downloads-src]: https://img.shields.io/npm/dt/cap-socket.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://www.npmjs.com/package/cap-socket

[license-src]: https://img.shields.io/npm/l/cap-socket.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://www.npmjs.com/package/cap-socket
