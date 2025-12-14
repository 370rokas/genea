
export enum DataCategory {
    Metrics = "Metrikai",
    Cemeteries = "Kapinės",
    Databases = "Duomenų bazės",
    Maps = "Žemėlapiai",
    Nobility = "Bajorai",
    Revisions = "Surašymai",
    OtherCountries = "Kitos šalys",
    ArchiveFonds = "Fondai",
    Articles = "Moksliniai straipsniai",
    Literature = "Literatūra",
    Tools = "Įrankiai",
    Pictures = "Nuotraukos",
    Other = "Kita"
};

export const vietovardziai: string[] = [
  "Vilnius",
  "Vilniaus gubernija",
  "Kaunas",
  "Trakų vaivadija",
  "Šančiai",
  "Rėkyvos dvaras",
  "Čikaga",
  "Jungtinės Valstijos",
  "Niujorkas",
  "Bostonas"
]

interface SourceData {
    id: string;
    
    title: string;
    description: string;
    link: string;

    category: string;
    tags: string[];

    locationNames: string[];
}

export const TEMP_DATA: SourceData[] = [
    {
        id: "1",
        title: "Istoriniai Vilniaus gatvių pavadinimai",
        link: "https://example.com/vilnius-street-names",
        description: "Duomenų rinkinys apie Vilniaus gatvių istorinius pavadinimus ir jų pokyčius laikui bėgant.",
        category: "Žemėlapiai",
        tags: ["gatvės", "išplanavimas"],
        locationNames: ["Vilnius"]
    },
    {
        id: "2",
        title: "Rimvydas Petrauskas \"Lietuvos diduomenė XIV a. pabaigoje - XV a.: sudėtis, struktūra, valdžia\"",
        link: "ISBN 995544567X",
        description: "Monografijos tikslas – istoriografijoje vyraujančios teorijos, pagal kurią lietuvių bajorijos viršūnė tik apie XV amžiaus vidurį suformavo savo savarankišką valdžią, kritika. Knygoje, apibrėžus diduomenės sąvoką, nagrinėjama XIV amžiaus pabaigos – XV amžiaus Lietuvos diduomenės kilmė, sudėtis ir struktūra. Galima išskirti dvi pagrindines lietuvių diduomenės raidos XV amžiuje tendencijas – personalinį tęstinumą ir vidinę (giminės struktūros) transformaciją, – kurios daugeliu atžvilgiu atitinka Vakarų ir Vidurio Rytų Europos bajorijoje vykusius procesus. XIV amžiaus antrojoje pusėje lietuvių bajorija buvo reikšmingas sociopolitinis veiksnys. Jau tuomet tai buvo pakankamai diferencijuota socialinė grupė. Aukščiausio jos sluoksnio atstovai savo rankose buvo sutelkę pagrindines valdžios funkcijas. XV amžiuje vyko „bajoro“ sąvokos devalvacijos procesas, kurio metu ji, nors ir liko kuopinio viso kilmingųjų luomo pavadinimu, tačiau kasdieniniame gyvenime tapo smulkiosios bajorijos sinonimu. Iš jų išsiskyrė tiesiogiai valdyme dalyvavusi diduomenė, kurią sudarė kelios šeimos. Nors ši socialinė grupė nebuvo teisiškai apibrėžta, o smulkieji bajorai teoriškai galėjo į ją patekti, tai padaryti pavyko labai menkai žemesniosios bajorijos atstovų daliai. Diduomenės sudėties stabilumas patvirtina paveldimą šio socialinio sluoksnio prigimtį. Vytauto laikų didikai tikrai buvo kilmingųjų palikuonys. Senosios diduomenės išnaikinimo ar išmirimo prielaida yra nepagrįsta. Didikų valdžia egzistavo šalia didžiojo kunigaikščio valdžios.",
        category: "Literatūra",
        tags: ["istorija", "bajorai"],
        locationNames: []
    },
    {
        id: "3",
        title: "X ir Y dvaro surašymas",
        link: "LVIA 515-25-XXXX",
        description: "Surašymo duomenys iš X ir Y dvarų, apimantys gyventojų sąrašus, amžių, lytį ir socialinę padėtį.",
        category: "Surašymai",
        tags: ["dvarai", "x dvaras", "y dvaras"],
        locationNames: ["X", "Y"],
    },
    {
        id: "4",
        title: "Amerikos lietuvių bendruomenės nuotraukos",
        link: "https://example.com/american-lithuanians-photos",
        description: "Nuotraukų kolekcija, vaizduojanti lietuvių bendruomenės gyvenimą Amerikoje nuo XX a. pradžios iki šių dienų.",
        category: "Nuotraukos",
        tags: ["JAV Lietuviai"],
        locationNames: ["JAV", "Čikaga", "New Yorkas", "Bostonas"]
    },
    {
        id: "5",
        title: "Kauno m. Šančių r. žemėlapis 18 a. pr.",
        link: "https://example.com/kaunas-sanciai-map-18th-century",
        description: "Šančių žemėlapis",
        category: "Žemėlapiai",
        tags: ["gatvės", "išplanavimas"],
        locationNames: ["Kaunas", "Šančiai"]
    },
    {
        id: "6",
        title: "Genutė Kirkienė \"LDK politikos elito galingieji: Chodkevičiai XV-XVI amžiuje\"",
        link: "ISBN 9789955333593",
        description: "Monografija",
        category: "Literatūra",
        tags: ["istorija", "bajorai", "Chodkevičiai"],
        locationNames: []
    }
];