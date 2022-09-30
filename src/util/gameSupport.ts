import * as path from 'path';
import * as Redux from 'redux';
import { selectors, types, util } from 'vortex-api';

export interface ISettingsFile {
  name: string;
  optional: boolean;
}

export interface IGameSupportEntry {
  mygamesPath: string;
  gameSettingsFiles: Array<string | ISettingsFile>;
}

const gameSupportXboxPass: { [gameId: string]: any } = {
  skyrimse: {
    mygamesPath: 'Skyrim Special Edition MS',
  },
  fallout4: {
    mygamesPath: 'Fallout4 MS',
  },
}

const gameSupportGOG: { [gameId: string]: Partial<IGameSupportEntry> } = {
  skyrimse: {
    mygamesPath: 'Skyrim Special Edition GOG',
  },
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
    gameSettingsFiles: ['Skyrim.ini', 'SkyrimPrefs.ini',
                        { name: 'SkyrimCustom.ini', optional: true }],
  },
  enderalspecialedition: {
    mygamesPath: 'Enderal Special Edition',
    gameSettingsFiles: ['Enderal.ini', 'EnderalPrefs.ini'],
  },
  skyrimvr: {
    mygamesPath: 'Skyrim VR',
    gameSettingsFiles: ['Skyrim.ini', 'SkyrimVR.ini', 'SkyrimPrefs.ini'],
  },
  fallout3: {
    mygamesPath: 'Fallout3',
    gameSettingsFiles: ['Fallout.ini', 'FalloutPrefs.ini',
                        { name: 'FalloutCustom.ini', optional: true }],
  },
  fallout4: {
    mygamesPath: 'Fallout4',
    gameSettingsFiles: ['Fallout4.ini', 'Fallout4Prefs.ini',
                        { name: 'Fallout4Custom.ini', optional: true }],
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

function isXboxPath(discoveryPath: string) {
  const hasPathElement = (element) =>
    discoveryPath.toLowerCase().includes(element);
  return ['modifiablewindowsapps', '3275kfvn8vcwc'].find(hasPathElement) !== undefined;
}

let gameStoreForGame: (gameId: string) => string = () => undefined;

export function initGameSupport(store: Redux.Store<types.IState>) {
  const state: types.IState = store.getState();

  gameStoreForGame = (gameId: string) => selectors.discoveryByGame(store.getState(), gameId)['store'];

  const {discovered} = state.settings.gameMode;

  Object.keys(gameSupportXboxPass).forEach(gameMode => {
    if (discovered[gameMode]?.path !== undefined) {
      if (isXboxPath(discovered[gameMode].path)) {
        gameSupport[gameMode].mygamesPath = gameSupportXboxPass[gameMode].mygamesPath;
      }
    }
  })

  if (discovered['enderalspecialedition']?.path !== undefined) {
    if (discovered['enderalspecialedition']?.path.toLowerCase().includes('skyrim')) {
      gameSupport['enderalspecialedition'] = JSON.parse(JSON.stringify(gameSupport['skyrimse']));
    }
  }
}

export function gameSupported(gameMode: string): boolean {
  return gameSupport[gameMode] !== undefined;
}

export function mygamesPath(gameMode: string): string {
  const relPath = (gameStoreForGame(gameMode) === 'gog') && !!gameSupportGOG[gameMode]
    ? gameSupportGOG[gameMode].mygamesPath
    : gameSupport[gameMode].mygamesPath;

  return path.join(util.getVortexPath('documents'), 'My Games', relPath);
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
  return path.join(util.getVortexPath('userData'), profile.gameId, 'profiles', profile.id);
}

export function backupPath(profile: types.IProfile): string {
  return path.join(util.getVortexPath('userData'), profile.gameId);
}
