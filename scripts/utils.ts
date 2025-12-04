import language from "../language.json";

//#region translation

let selectedLanguage: string = "english";

export function getSelectedLanguage() { return selectedLanguage; }

export function setSelectedLanuage(newLanguage: string) {
    selectedLanguage = newLanguage;
}

export function getTranslatedText(id: string): string {
    if (selectedLanguage == "english") return id;
    return language[id][selectedLanguage];
}

//#endregion

//#region system color

const darkMode: boolean = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

export function getSystemBackgroundColor(): number {
    return darkMode ? 0x010101 : 0xf0f0f0;
}

export function getSystemTextColor(): string {
    return darkMode ? "white" : "black";
}

export function getSystemSkyColor(): number {
    return darkMode ? 0xbbbbff : 0xffffbb;
}

export function getSystemGroundColor(): number {
    return darkMode ? 0xddddff : 0xcccc99;
}

export function getSystemAmbientColor(): number {
    return darkMode ? 0x333333 : 0x666666;
}

//#endregion