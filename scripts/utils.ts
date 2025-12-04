import language from "../language.json";

let selectedLanguage: string = "spanish";

export function setSelectedLanuage(language: string) {
    selectedLanguage = language;
    console.log("language set to " + language);
}

export function getTranslatedText(id: string): string {
    if (selectedLanguage == "english") return id;
    console.log(language[id][selectedLanguage]);
    return language[id][selectedLanguage];
}