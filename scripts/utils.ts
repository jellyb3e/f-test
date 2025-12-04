import language from "../language.json";

let selectedLanguage: string = "english";

export function getSelectedLanguage() { return selectedLanguage; }

export function setSelectedLanuage(newLanguage: string) {
    selectedLanguage = newLanguage;
}

export function getTranslatedText(id: string): string {
    if (selectedLanguage == "english") return id;
    return language[id][selectedLanguage];
}