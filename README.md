# NB! it's a prelease version, provided AS IS


## NodeJS library for controlling WiZ Lights via UDP

### Prerequisites

1.  MacOS/Linux
2.  NodeJS >8.11.1

### Usage

#### Looking for the devices and listening for the status updates

Create instance of WiZLocalControl class

```javascript
const wizLocalControl = new WiZLocalControl({
  incomingMsgCallback: (msg: WiZMessage, ip) => {
    console.log(`Received the message from WiZ Light ${JSON.stringify(msg)}`)
  },
  interfaceName: config.udp.interfaceName
});
```

Start listening for the incoming messages

```javascript
wizLocalControl.startListening();
```

#### Controlling WiZ lights

###### Change brightness

  `changeBrightness(brightness: number, lightIp: string)`

  * `brightness` – Integer from range 10..100

  Sample request

  ```javascript
  wizLocalControl.changeBrightness(10, "192.168.1.21"));
  ```

###### Change status (ON or OFF)
  `changeStatus(status: boolean, lightIp: string)`

  * `status` – `true` will turn light ON, `false` - OFF

  Sample request

  ```javascript
  wizLocalControl.changeStatus(true, "192.168.1.21"));
  ```

###### Change light mode - change currently played scene, or color temperature or RGB color
  `changeLightMode(lightMode: LightMode, lightIp:string)`

  * `lightMode` could be either
    * `{ type: "scene", sceneId: sceneId }`, where `sceneId` is an integer from range 1..28
    * `{ type: "color", r: red, g: green, b: blue }` – where `r`, `g`, `b` are integers from range 0..255
    * `{ type: "temperature", colorTemperature: colorTemperature }` – where `colorTemperature` is integere from range 2200..6500

  Sample requests

  ```javascript
  // Change scene to Ocean
  wizLocalControl.changeLightMode({
    type: "scene",
    sceneId: 1
  }, "192.168.1.21");
  ```

  ```javascript
  // Change color to yellow
  wizLocalControl.changeLightMode({
      type: "color",
      r: 255,
      g: 255,
      b: 0,
    },
    "192.168.1.21");
  ```

  ```javascript
  // Change color temperature to approx. 4000K
  wizLocalControl.changeLightMode({
    type: "temperature",
    colorTemperature: 4000
  }, "192.168.1.21"))
  ```

###### Change speed - change speed of the currently played dynamic scene (Ocean, Romance, Party, etc).
  `changeSpeed(speed: number, lightIp: string)`

  * `speed` – Integer from range 20..200

  Sample request

  ```javascript
  wizLocalControl.changeSpeed(140, "192.168.1.21"));
  ```
