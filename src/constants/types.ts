import * as networkConstants from "../constants/communication";
import {
  validate,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsString,
  IsOptional,
  IsArray,
} from "class-validator";
import { convertPWMRefreshRateToPWMConf } from "../helpers";

/**
 * Scene type – built in the bulb scenes. Could be one of the scenes listed
 * in staticScenes const
 */
export type Scene = {
  type: "scene";
  sceneId: number;
  name: string;
};

/**
 * Light Mode type,
 * could be either
 * 1. Scene – determined by sceneId (1-28)
 * 2. Color - determined by Red, Green, Blue, Cool White, Warm White
 * (0-255). There is a limit on a maximum amount of channels used in the same time:
 * 3 RGB or 2 RGB + 1 White or 2 Whites
 * 3. Color temperature – form color temperature using Cool and Warm white LEDs (2000-9000)
 */
export type LightMode =
  | Scene
  | {
      type: "color";
      r: number;
      g: number;
      b: number;
      cw: number;
      ww: number;
    }
  | {
      type: "temperature";
      colorTemperature: number;
    };

/**
 * MQTT connection status,
 * lamp will report it under some certain testing conditions
 */
export enum MQTTConnectionStatus {
  Success = 0,
  LibraryError = -1,
  NetworkConnectionError = -2,
  MQTTServerCertMissing = -3,
  MQTTServerCertMalformed = -4,
  HandshakeError = -5,
  MQTTServerCertMismatch = -6,
  MQTTLibraryError = 1,
  NoCredentials = 2,
  MQTTClientInitFailure = 3,
  ErrorLoadingPasswordFromFlash = 4,
  PasswordError = 5,
}
/**
 * Incoming message that lamp sends to report its status
 */
export type SyncPilotMessage = {
  method: "syncPilot";
  id: number;
  env: string;
  timestamp: Date;
  ip: string;
  params: {
    r?: number;
    g?: number;
    b?: number;
    w?: number;
    c?: number;
    state?: boolean;
    sceneId?: number;
    temp?: number;
    dimming?: number;
    rssi: number;
    mac: string;
    mqttCd?: number;
    src: string;
    ratio?: number;
  };
};
/**
 * Incoming message that lamp is updating firmware and the status changed
 */
export type UpdateOtaMessage = {
  method: "updateOta";
  id: number;
  env: string;
  timestamp: Date;
  ip: string;
  params: {
    updateStatus?: number;
  };
};

/**
 * Acknowledgement message device should send to
 * the lamp on receiving SyncPilot message
 */
export type SyncPilotAckMessage = {
  method: "syncPilot";
  id: number;
  env: string;
  result: {
    mac: string;
  };
};

/**
 * Message sent to the lamp requesting its status
 */
export type GetPilotMessage = {
  method: "getPilot";
  version: number;
  id: number;
};

/**
 * Set Pilot messages parameters for changing color
 */
export class SetPilotParametersColor {
  @IsInt()
  @Min(0)
  @Max(255)
  r?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  g?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  b?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  w?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  c?: number;

  constructor(
    r: number,
    g: number,
    b: number,
    coolWhiteLevel: number,
    warmWhiteLevel: number,
  ) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.w = warmWhiteLevel;
    this.c = coolWhiteLevel;
  }
}

/**
 * Set Pilot messages parameters for changing color and brightness
 */
export class SetPilotParametersColorAndBrightness {
  @IsInt()
  @Min(0)
  @Max(255)
  r?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  g?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  b?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  w?: number;
  @IsInt()
  @Min(0)
  @Max(255)
  c?: number;
  @IsInt()
  @Min(10)
  @Max(100)
  dimming?: number;

  constructor(
    r: number,
    g: number,
    b: number,
    coolWhiteLevel: number,
    warmWhiteLevel: number,
    brightness: number,
  ) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.w = warmWhiteLevel;
    this.c = coolWhiteLevel;
    this.dimming = brightness;
  }
}

/**
 * Set Pilot messages parameters for scene
 */
export class SetPilotParametersScene {
  @IsInt()
  @Min(1)
  @Max(32)
  sceneId?: number;

  constructor(sceneId: number) {
    this.sceneId = sceneId;
  }
}

/**
 * Set Pilot messages parameters for ratio
 */
export class SetPilotParametersRatio {
  @IsInt()
  @Min(0)
  @Max(100)
  ratio?: number;

  constructor(ratio: number) {
    this.ratio = ratio;
  }
}

/**
 * Set Pilot messages parameters for scene and brightness
 */
export class SetPilotParametersSceneAndBrightness {
  @IsInt()
  @Min(1)
  @Max(32)
  sceneId?: number;
  @IsInt()
  @Min(10)
  @Max(100)
  dimming?: number;

  constructor(sceneId: number, brightness: number) {
    this.sceneId = sceneId;
    this.dimming = brightness;
  }
}

/**
 * Set Pilot messages parameters for status
 */
export class SetPilotParametersStatus {
  state?: boolean;

  constructor(status: boolean) {
    this.state = status;
  }
}

/**
 * Set Pilot messages parameters for changing dimming
 */
export class SetPilotParametersDimming {
  @IsInt()
  @Min(10)
  @Max(100)
  dimming?: number;

  constructor(dimming: number) {
    this.dimming = dimming;
  }
}

/**
 * Set Pilot messages parameters for changing speed
 */
export class SetPilotParametersSpeed {
  @IsInt()
  @Min(20)
  @Max(200)
  speed?: number;

  constructor(speed: number) {
    this.speed = speed;
  }
}

/**
 * Set Pilot messages parameters for changing color temperature and brightness
 */
export class SetPilotParametersColorTemperatureAndBrightness {
  @IsInt()
  @Min(2000)
  @Max(9000)
  temp?: number;
  @IsInt()
  @Min(10)
  @Max(100)
  dimming?: number;

  constructor(temperature: number, brightness: number) {
    this.temp = temperature;
    this.dimming = brightness;
  }
}

/**
 * Set Pilot messages parameters for changing color temperature and brightness
 */
export class SetPilotParametersColorTemperature {
  @IsInt()
  @Min(2000)
  @Max(9000)
  temp?: number;

  constructor(temperature: number) {
    this.temp = temperature;
  }
}

export type SetPilotParams =
  | SetPilotParametersColor
  | SetPilotParametersColorAndBrightness
  | SetPilotParametersColorTemperature
  | SetPilotParametersColorTemperatureAndBrightness
  | SetPilotParametersDimming
  | SetPilotParametersScene
  | SetPilotParametersSceneAndBrightness
  | SetPilotParametersSpeed
  | SetPilotParametersStatus
  | SetPilotParametersRatio;

export class SetPilotMessage {
  method: "setPilot";
  version: number;
  id: number;
  @ValidateNested() params: SetPilotParams;

  constructor() {
    this.method = networkConstants.setPilotMethod;
    this.id = Math.floor(Math.random() * 10000 + 1);
    this.version = 1;
  }
  /**
   * Constructs dimming control message
   * @param dimming - Integer, valid range is 10-100
   */
  static buildDimmingControlMessage(dimming: number): SetPilotMessage {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersDimming(dimming);
    return msg;
  }

  /**
   * Constructs status control message
   * @param status - Boolean, true - turn the lamp on, false - off
   */
  static buildStatusControlMessage(status: boolean): SetPilotMessage {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersStatus(status);
    return msg;
  }

  /**
   * Constructs scene control message
   * @param scene - Scene object, from the list of static scenes
   */
  static buildSceneControlMessage(scene: Scene): SetPilotMessage {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersScene(scene.sceneId);
    return msg;
  }

  /**
   * Constructs scene control message
   * @param scene - Scene object, from the list of static scenes
   * @param dimming - Integer, valid range is 10-100
   */
  static buildSceneAndBrightnessControlMessage(
    scene: Scene,
    dimming: number,
  ): SetPilotMessage {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersSceneAndBrightness(
      scene.sceneId,
      dimming,
    );
    return msg;
  }

  /**
   * Constructs color control message.
   * Valid combinations: R+G+B, R+G+(W|C), G+B+(W|C), R+B+(W|C), W+C.
   * R+G+B+(W|C), W+C+(R|G|B) could not be played due to limitations in the light engine
   * @param red - Integer, valid range 0-255
   * @param green - Integer, valid range 0-255
   * @param blue - Integer, valid range 0-255
   * @param coolWhiteLevel - Integer, valid range 0-255
   * @param warmWhiteLevel - Integer, valid range 0-255
   */
  static buildColorControlMessage(
    red: number,
    green: number,
    blue: number,
    coolWhiteLevel: number,
    warmWhiteLevel: number,
  ) {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersColor(
      red,
      green,
      blue,
      coolWhiteLevel,
      warmWhiteLevel,
    );
    return msg;
  }

  /**
   * Constructs color + dimming control message.
   * Valid combinations: R+G+B, R+G+(W|C), G+B+(W|C), R+B+(W|C), W+C.
   * R+G+B+(W|C), W+C+(R|G|B) could not be played due to limitations in the light engine
   * @param red - Integer, valid range 0-255
   * @param green - Integer, valid range 0-255
   * @param blue - Integer, valid range 0-255
   * @param coolWhiteLevel - Integer, valid range 0-255
   * @param warmWhiteLevel - Integer, valid range 0-255
   * @param dimming - Integer, valid range is 10-100
   */
  static buildColorAndBrightnessControlMessage(
    red: number,
    green: number,
    blue: number,
    coolWhiteLevel: number,
    warmWhiteLevel: number,
    dimming: number,
  ) {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersColorAndBrightness(
      red,
      green,
      blue,
      coolWhiteLevel,
      warmWhiteLevel,
      dimming,
    );
    return msg;
  }

  /**
   * Constructs color temperature control message.
   * @param colorTemperature - Integer, valid range 2000-9000
   */
  static buildColorTemperatureControlMessage(colorTemperature: number) {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersColorTemperature(colorTemperature);
    return msg;
  }

  /**
   * Constructs color temperature control message.
   * @param colorTemperature - Integer, valid range 2000-9000
   * @param dimming - Integer, valid range is 10-100
   */
  static buildColorTemperatureAndBrightnessControlMessage(
    colorTemperature: number,
    dimming: number,
  ) {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersColorTemperatureAndBrightness(
      colorTemperature,
      dimming,
    );
    return msg;
  }

  /**
   * Constructs playing speed control message.
   * Valid only for dynamic scenes
   * @param speed Playing speed, valid range 20-200
   */
  static buildSpeedControlMessage(speed: number) {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersSpeed(speed);
    return msg;
  }

  /**
   * Constructs ratio control message
   * @param ratio - Ratio between zones brightess, number in range 0..100
   */
  static buildRatioControlMessage(ratio: number) {
    const msg = new SetPilotMessage();
    msg.params = new SetPilotParametersRatio(ratio);
    return msg;
  }
}

export interface SetSystemConfigMessageParameters {
  environment?: string;
  moduleName?: string;
  extendedWhiteFactor?: string;
  pwmRefreshRate?: number;
  whiteChannels?: number;
  whiteToColorsRatio?: number;
}

/**
 * Set system config messages parameters for request
 */
export class SetSystemConfigParameters {
  @IsOptional()
  @IsString()
  env?: string;
  @IsInt()
  systemConfigTs: number;
  @IsOptional()
  @IsString()
  moduleName?: string;
  @IsOptional()
  @IsString()
  ewf?: string;
  @IsOptional()
  @IsString()
  pwmConf?: string;
  @IsOptional()
  @IsArray()
  drvConf?: number[];

  constructor(parameters: SetSystemConfigMessageParameters) {
    if (parameters.environment != undefined) {
      this.env = parameters.environment;
    }
    if (parameters.moduleName != undefined) {
      this.moduleName = parameters.moduleName;
    }
    if (parameters.extendedWhiteFactor != undefined) {
      this.ewf = parameters.extendedWhiteFactor;
    }
    if (parameters.pwmRefreshRate != undefined) {
      this.pwmConf = convertPWMRefreshRateToPWMConf(parameters.pwmRefreshRate);
    }
    if (
      parameters.whiteChannels != undefined &&
      parameters.whiteToColorsRatio != undefined
    ) {
      this.drvConf = [parameters.whiteToColorsRatio, parameters.whiteChannels];
    }
    this.systemConfigTs = 0;
  }
}

export class SetSystemConfigMessage {
  method: "setSystemConfig";
  version: number;
  id: number;
  @ValidateNested() params: SetSystemConfigParameters;

  constructor() {
    this.method = networkConstants.setSystemConfigMethod;
    this.version = 1;
    this.id = Math.floor(Math.random() * 10000 + 1);
  }
  /**
   * Constructs firmware update message
   */
  static buildSetEnvironmentMessage(
    environment: string,
  ): SetSystemConfigMessage {
    const msg = new SetSystemConfigMessage();
    msg.params = new SetSystemConfigParameters({
      environment,
    });
    return msg;
  }
  /**
   * Constructs changing of module name message
   */
  static buildSetModuleNameMessage(moduleName: string): SetSystemConfigMessage {
    const msg = new SetSystemConfigMessage();
    msg.params = new SetSystemConfigParameters({
      moduleName,
    });
    return msg;
  }
  /**
   * Constructs update ewf message
   */
  static buildSetExtendedWhiteFactorMessage(
    extendedWhiteFactor: string,
  ): SetSystemConfigMessage {
    const msg = new SetSystemConfigMessage();
    msg.params = new SetSystemConfigParameters({
      extendedWhiteFactor,
    });
    return msg;
  }
  /**
   * Constructs general message
   */
  static buildSetSystemConfigMessage(
    parameters: SetSystemConfigMessageParameters,
  ): SetSystemConfigMessage {
    const msg = new SetSystemConfigMessage();
    msg.params = new SetSystemConfigParameters(parameters);
    return msg;
  }
}

export interface SetUserConfigMessageParameters {
  whiteTemperatureMin?: number;
  whiteTemperatureMax?: number;
  extendedTemperatureMin?: number;
  extendedTemperatureMax?: number;
  pwmMin?: number;
  pwmMax?: number;
}

/**
 * Set system config messages parameters for request
 */
export class SetUserConfigParameters {
  @IsInt()
  userConfigTs: number;
  @IsOptional()
  @IsArray()
  whiteRange?: number[];
  @IsOptional()
  @IsArray()
  extRange?: number[];
  @IsOptional()
  @IsArray()
  pwmRange?: number[];

  constructor(parameters: SetUserConfigMessageParameters) {
    if (
      parameters.whiteTemperatureMin != undefined &&
      parameters.whiteTemperatureMax != undefined
    ) {
      this.whiteRange = [
        parameters.whiteTemperatureMin,
        parameters.whiteTemperatureMax,
      ];
    }
    if (
      parameters.extendedTemperatureMin != undefined &&
      parameters.extendedTemperatureMax != undefined
    ) {
      this.extRange = [
        parameters.extendedTemperatureMin,
        parameters.extendedTemperatureMax,
      ];
    }
    if (parameters.pwmMin != undefined && parameters.pwmMax != undefined) {
      this.pwmRange = [parameters.pwmMin, parameters.pwmMax];
    }
    this.userConfigTs = 0;
  }
}

export class SetUserConfigMessage {
  method: "setUserConfig";
  version: number;
  id: number;
  @ValidateNested() params: SetUserConfigParameters;

  constructor() {
    this.method = networkConstants.setUserConfigMethod;
    this.version = 1;
    this.id = Math.floor(Math.random() * 10000 + 1);
  }
  /**
   * Constructs temperature range update message
   */
  static buildSetTemperatureRangeMessage(
    whiteTemperatureMin: number,
    whiteTemperatureMax: number,
    extendedTemperatureMin: number,
    extendedTemperatureMax: number,
  ): SetUserConfigMessage {
    const msg = new SetUserConfigMessage();
    msg.params = new SetUserConfigParameters({
      whiteTemperatureMin,
      whiteTemperatureMax,
      extendedTemperatureMin,
      extendedTemperatureMax,
    });
    return msg;
  }
  /**
   * Constructs SetUserConfig message
   */
  static buildSetUserConfigMessage(
    parameters: SetUserConfigMessageParameters,
  ): SetUserConfigMessage {
    const msg = new SetUserConfigMessage();
    msg.params = new SetUserConfigParameters(parameters);
    return msg;
  }
}

/**
 * Update firmware messages parameters for request
 */
export class UpdateFirmwareParameters {
  @IsString()
  fw: string;
  @IsInt()
  @Min(0)
  @Max(1)
  force: number;

  constructor(firmwareVersion: string | undefined) {
    this.fw = firmwareVersion || "default";
    this.force = 1;
  }
}

export class UpdateFirmwareMessage {
  method: "updateOta";
  version: number;
  id: number;
  @ValidateNested() params: UpdateFirmwareParameters;

  constructor() {
    this.method = networkConstants.updateOtaMethod;
    this.version = 1;
    this.id = Math.floor(Math.random() * 10000 + 1);
  }
  /**
   * Constructs firmware update message
   */
  static buildUpdateFirmwareMessage(
    firmwareVersion: string | undefined,
  ): UpdateFirmwareMessage {
    const msg = new UpdateFirmwareMessage();
    msg.params = new UpdateFirmwareParameters(firmwareVersion);
    return msg;
  }
}

export class ResetMessage {
  method: "reset";
  version: number;
  id: number;

  constructor() {
    this.method = networkConstants.resetMethod;
    this.version = 1;
    this.id = Math.floor(Math.random() * 10000 + 1);
  }
  /**
   * Constructs reset message
   */
  static buildResetMessage(): ResetMessage {
    const msg = new ResetMessage();
    return msg;
  }
}

export class RebootMessage {
  method: "reboot";
  version: number;
  id: number;

  constructor() {
    this.method = networkConstants.rebootMethod;
    this.version = 1;
    this.id = Math.floor(Math.random() * 10000 + 1);
  }
  /**
   * Constructs reboot message
   */
  static buildRebootMessage(): RebootMessage {
    const msg = new RebootMessage();
    return msg;
  }
}

/**
 * Message broadcasted by the light after booting,
 * way to inform nearby devices about its presence
 */
export type FirstBeatMessage = {
  method: "firstBeat";
  id: number;
  env: string;
  params: {
    mac: string;
    fwVersion: string;
  };
};

/**
 * Message sent by device to the lamp (via broadcast or unicast)
 * Lamp will add specified IP to the list devices that it notifies on status change using
 * SyncPilot messages
 */
export class RegistrationMessage {
  method: "registration";
  version: number;
  id: number;
  params: {
    register: boolean;
    phoneMac: string;
    phoneIp: string;
  };
  constructor(ip: string, mac: string) {
    this.method = networkConstants.registrationMethod;
    this.id = Math.floor(Math.random() * 10000 + 1);
    this.version = 1;
    this.params = {
      register: true,
      phoneIp: ip,
      phoneMac: mac,
    };
  }
}

/**
 * WiZ Light system configuration (fwVersion for example)
 */
export type GetSystemConfigResponse = {
  method: "getSystemConfig";
  result: {
    homeId: number;
    lock: boolean;
    groupId: number;
    typeId: number;
    fwOtaStatus: number;
    fwVersion: string;
  };
};
/**
 * Message sent to the lamp requesting its system configuration (fwVersion for example)
 */
export class GetSystemConfigMessage {
  method: "getSystemConfig";
  version: number;
  id: number;
  constructor(ip: string) {
    this.method = networkConstants.getSystemConfigMethod;
    this.id = Math.floor(Math.random() * 10000 + 1);
    this.version = 1;
  }
}

export type WiZControlMessage =
  | SetPilotMessage
  | SyncPilotAckMessage
  | RegistrationMessage
  | UpdateFirmwareMessage
  | GetSystemConfigMessage
  | SetSystemConfigMessage
  | ResetMessage
  | RebootMessage
  | SetUserConfigMessage;

export type WiZMessage =
  | GetPilotMessage
  | SetPilotMessage
  | SyncPilotMessage
  | UpdateOtaMessage
  | FirstBeatMessage
  | RegistrationMessage
  | UpdateFirmwareMessage
  | SetSystemConfigMessage
  | ResetMessage
  | RebootMessage
  | SetUserConfigMessage;

export type WiZMessageResponse = GetSystemConfigResponse;

export type Result<T extends WiZMessageResponse> =
  | {
      type: "success";
      method: string;
      params: T;
    }
  | {
      type: "error";
      message: string;
    };

export const staticScenes: Array<LightMode> = [
  {
    type: "scene",
    sceneId: 1,
    name: "Ocean",
  },
  {
    type: "scene",
    sceneId: 2,
    name: "Romance",
  },
  {
    type: "scene",
    sceneId: 3,
    name: "Sunset",
  },
  {
    type: "scene",
    sceneId: 4,
    name: "Party",
  },
  {
    type: "scene",
    sceneId: 5,
    name: "Fireplace",
  },
  {
    type: "scene",
    sceneId: 6,
    name: "Cozy",
  },
  {
    type: "scene",
    sceneId: 7,
    name: "Forest",
  },
  {
    type: "scene",
    sceneId: 8,
    name: "Pastel colors",
  },
  {
    type: "scene",
    sceneId: 9,
    name: "Wake up",
  },
  {
    type: "scene",
    sceneId: 10,
    name: "Bedtime",
  },
  {
    type: "scene",
    sceneId: 11,
    name: "Warm white",
  },
  {
    type: "scene",
    sceneId: 12,
    name: "Daylight",
  },
  {
    type: "scene",
    sceneId: 13,
    name: "Cool white",
  },
  {
    type: "scene",
    sceneId: 14,
    name: "Night Light",
  },
  {
    type: "scene",
    sceneId: 15,
    name: "Focus",
  },
  {
    type: "scene",
    sceneId: 16,
    name: "Relax",
  },
  {
    type: "scene",
    sceneId: 17,
    name: "True colors",
  },
  {
    type: "scene",
    sceneId: 18,
    name: "TV Time",
  },
  {
    type: "scene",
    sceneId: 19,
    name: "Plant growth",
  },
  {
    type: "scene",
    sceneId: 20,
    name: "Spring",
  },
  {
    type: "scene",
    sceneId: 21,
    name: "Summer",
  },
  {
    type: "scene",
    sceneId: 22,
    name: "Fall",
  },
  {
    type: "scene",
    sceneId: 23,
    name: "Deep dive",
  },
  {
    type: "scene",
    sceneId: 24,
    name: "Jungle",
  },
  {
    type: "scene",
    sceneId: 25,
    name: "Mojito",
  },
  {
    type: "scene",
    sceneId: 26,
    name: "Club",
  },
  {
    type: "scene",
    sceneId: 27,
    name: "Christmas",
  },
  {
    type: "scene",
    sceneId: 28,
    name: "Halloween",
  },
  {
    type: "scene",
    sceneId: 29,
    name: "Candlelight",
  },
  {
    type: "scene",
    sceneId: 30,
    name: "Golden White",
  },
  {
    type: "scene",
    sceneId: 31,
    name: "Pulse",
  },
  {
    type: "scene",
    sceneId: 32,
    name: "Steampunk",
  },
];

export type Color = {
  red: number;
  green: number;
  blue: number;
};
