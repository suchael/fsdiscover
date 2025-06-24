const {
  mouse,
  Point,
  Button,
  keyboard,
  Key,
} = require("@nut-tree-fork/nut-js");

class Device {
  constructor(handlers, authHandler, type = String(), client) {
    this.handlers = handlers;
    this.authHandler = authHandler;
    this.history = [];
    this.type = type;
    this.clientSocket = client;
  }

  parseDevice(clientId, reject = (error = String()) => error) {
    this.clientId = clientId;
    if (
      this.authHandler.getConfig().devices.filter((d) => d.type == this.type)
        .length > 100
    ) {
      return reject(
        "Too many devices, please remove some devices before adding a new one."
      );
    }
    if (
      this.authHandler
        .getConfig()
        .devices.some(
          (device) => device.clientId == clientId && device.type == this.type
        )
    ) {
      return reject("Device already exists.");
    }
    this.authHandler.config.devices.push({
      clientId,
      type: this.type,
      name: "Controller",
      buttons: 3,
      scrollWheel: true,
      gestures: [],
      user: this.user,
      date:`${new Date()}`
    });
    this.authHandler.saveConfig();
  }

  validateDevice() {
    const clientId = this.clientId;
    const device = this.authHandler
      .getConfig()
      .devices.find(
        (device) => device.clientId == clientId && device.type == this.type
      );
    if (!device) {
      return "Invalid device... Your device does not exist in device index"
    }
  }

  remDevice(reject = (error = String()) => error) {
    const clientId = this.clientId;
    const deviceIndex = this.authHandler
      .getConfig()
      .devices.findIndex(
        (device) => device.clientId == clientId && device.type == this.type
      );
    if (deviceIndex == -1) {
      return reject("Device ejection failed... Device not found.");
    }
    this.authHandler.config.devices ==
      this.authHandler
        .getConfig()
        .devices.filter((d) => d.clientId !== clientId && d.type !== this.type);
    this.authHandler.saveConfig();
    return reject("Device removed successfully.");
  }

  parseHistory = (history) => {
    this.history.push(history);
    this.history.length > 10 && this.history.shift();
  };
}

class Mouse extends Device {
  async mouseEvent(event, reject = (error = String()) => error) {
    const clientId = this.clientId;
    const device = this.authHandler
      .getConfig()
      .devices.find(
        (device) => device.clientId == clientId && device.type == this.type
      );
    if (!device) {
      return reject("Invalid device... Your device does not exist in device index");
    }
    // const lastEvent = this.history[this.history.length - 1] || {};
    const currentPos = await mouse.getPosition();

    if (event.click) {
      const h = Boolean(this.clickHold);
      this.clickHold && mouse.releaseButton(Button.LEFT);
      this.clickHold && (this.clickHold = !this.clickHold);
      !h &&
        (await mouse.click(
          event.click == "right" ? Button.RIGHT : Button.LEFT
        ));
    }

    if (event.mouseDownHold && !this.clickHold) {
      this.clickHold = true;
      await mouse.pressButton(Button.LEFT);
    }

    await mouse["move"]([
      new Point(currentPos.x + event.dispX, currentPos.y + event.dispY),
    ]);

    if (event.scrollX) {
      const { scrollX } = event;
      if (scrollX >= 1) {
        mouse.scrollRight(1);
      }
      if (scrollX <= 0) {
        mouse.scrollRight(-1);
      }
    }
    if (event.scrollY) {
      const { scrollY } = event;
      if (scrollY >= 1) {
        mouse.scrollUp(1);
      }
      if (scrollY <= 0) {
        mouse.scrollUp(-1);
      }
    }
    this.parseHistory(event);
  }

  cleanUp = () => {
    mouse.releaseButton(Button.LEFT)
    mouse.releaseButton(Button.RIGHT)
    mouse.releaseButton(Button.MIDDLE);
  }

  async middleClick() {
    const v = this.validateDevice();
    if (v) {
      return reject(v);
    }
    await mouse.click(Button.MIDDLE)
  }
}

class Keyboard extends Device {
  async keydown(event, reject = (error = String()) => error) {
    const v = this.validateDevice()
    if (v) {
      return reject(v)
    }
    const key = Key[event];
    this.history.push(event);
    // return console.log("keydown", event, key);
    await keyboard.pressKey(key || 229);
    this.clientSocket.emit("downkeys", this.history);
  }

  async keyup(event, reject = (error = String()) => error) {
    const key = Key[event];
    this.history = this.history.filter((i) => i !== event);
    // return console.log("keyup", event, key);
    await keyboard.releaseKey(key || 229);
    this.clientSocket.emit("downkeys", this.history);
  }

  async keypress(event, reject = (error = String()) => error) {
    const v = this.validateDevice();
    if (v) {
      return reject(v);
    }
    const key = event;
    // return console.log("keypress", key);
    await keyboard.type(key || 229);
  }

  async keytype(event, reject = (error = String()) => error) {
    const v = this.validateDevice();
    if (v) {
      return reject(v);
    }
    const key = Key[event];
    // return console.log("keypress", key);
    Key['Escape']
    await keyboard.pressKey(key || 229);
    await keyboard.releaseKey(key || 229);
  }

  cleanUp=()=>{
    const keys = this.history.map(k => Key[k])
    for (const element of keys) {
      keyboard.releaseKey(element)
    }
  }
}

module.exports.Mouse = Mouse;
module.exports.Keyboard = Keyboard;
