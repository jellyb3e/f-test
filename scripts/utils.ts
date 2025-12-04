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
    if (darkMode) {
        return 0x000000;
    } else {
        return 0xf0f0f0;
    }
}

export function getSystemTextColor(): string {
    if (darkMode) {
        return "white";
    } else {
        return "black";
    }
}

//#endregion