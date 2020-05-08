import { app as appIn, remote } from 'electron';
import * as path from 'path';
import { types } from 'vortex-api';

const app = appIn || remote.app;

export interface ISettingsFile {
  name: string;
  optional: boolean;
}

export interface IGameSupportEntry {
  mygamesPath: string;
  gameSettingsFiles: Array<string | ISettingsFile>;
}

const gameSupport: { [gameId: string]: IGameSupportEntry } = {
  skyrim: {
    mygamesPath: 'skyrim',
    gameSettingsFiles: ['Skyrim.ini', 'SkyrimPrefs.ini'],
  },
  enderal: {
    mygamesPath: 'Enderal',
    gameSettingsFiles: ['Enderal.ini', 'EnderalPrefs.ini'],
  },
  skyrimse: {
    mygamesPath: 'Skyrim Special Edition',
    gameSettingsFiles: ['Skyrim.ini', 'SkyrimPrefs.ini'],
  },
  skyrimvr: {
    mygamesPath: 'Skyrim VR',
    gameSettingsFiles: ['Skyrim.ini', 'SkyrimVR.ini', 'SkyrimPrefs.ini'],
  },
  fallout3: {
    mygamesPath: 'Fallout3',
    gameSettingsFiles: ['Fallout.ini'],
  },
  fallout4: {
    mygamesPath: 'Fallout4',
    gameSettingsFiles: ['Fallout4.ini', 'Fallout4Prefs.ini'],
  },
  fallout4vr: {
    mygamesPath: 'Fallout4VR',
    gameSettingsFiles: ['Fallout4Custom.ini', 'Fallout4Prefs.ini'],
  },
  falloutnv: {
    mygamesPath: 'FalloutNV',
    gameSettingsFiles: ['Fallout.ini', 'FalloutPrefs.ini',
                        { name: 'FalloutCustom.ini', optional: true }],
  },
  oblivion: {
    mygamesPath: 'Oblivion',
    gameSettingsFiles: ['Oblivion.ini'],
  },
};

export function gameSupported(gameMode: string): boolean {
  return gameSupport[gameMode] !== undefined;
}

export function mygamesPath(gameMode: string): string {
  return path.join(app.getPath('documents'), 'My Games',
                   gameSupport[gameMode].mygamesPath);
}

export function gameSettingsFiles(gameMode: string, customPath: string): ISettingsFile[] {
  const fileNames = gameSupport[gameMode].gameSettingsFiles;

  const mapFile = (input: string | ISettingsFile): ISettingsFile => typeof(input) === 'string'
    ? { name: input, optional: false }
    : input;

  if (customPath === null) {
    return fileNames.map(mapFile);
  } else {
    return fileNames
      .map(mapFile)
      .map(input => ({ name: path.join(customPath, input.name), optional: input.optional }));
  }
}

export function profilePath(profile: types.IProfile): string {
  return path.join(app.getPath('userData'), profile.gameId, 'profiles', profile.id);
}

export function backupPath(profile: types.IProfile): string {
  return path.join(app.getPath('userData'), profile.gameId);
}
