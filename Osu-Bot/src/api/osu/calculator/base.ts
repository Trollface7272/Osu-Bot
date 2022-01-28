import { Beatmaps } from "@osuapi/endpoints/beatmap";

export interface CalculateParams {
    Counts: {
        "300": number
        "100": number
        "50": number
        geki: number
        katu: number
        miss: number
    },
    Combo: number
    Mods: string[]
}

export interface BeatmapParserAttributes {
    star_rating: number,
    max_combo: number,
    aim_difficulty: number,
    speed_difficulty: number,
    flashlight_difficulty: number,
    slider_factor: number,
    approach_rate: number,
    overall_difficulty: number
}

export interface BeatmapParserResult {
    ruleset_id: number
    beatmap_id: number
    beatmap: string
    mods: { acronym: string, settings: unknown }
    attributes: BeatmapParserAttributes
}

export interface BeatmapParserOut {
    errors: string[]
    results: BeatmapParserResult[]
}

export class CalculatorBase {
    public async Calculate(map: Beatmaps.Beatmap, params: CalculateParams): Promise<any> { };
    constructor() { };
}

export const Mods = {
    Bit: {
        None: 0,
        NoFail: 1 << 0,
        Easy: 1 << 1,
        TouchDevice: 1 << 2,
        Hidden: 1 << 3,
        HardRock: 1 << 4,
        SuddenDeath: 1 << 5,
        DoubleTime: 1 << 6,
        Relax: 1 << 7,
        HalfTime: 1 << 8,
        Nightcore: 1 << 9,
        Flashlight: 1 << 10,
        Autoplay: 1 << 11,
        SpunOut: 1 << 12,
        Relax2: 1 << 13,
        Perfect: 1 << 14,
        Key4: 1 << 15,
        Key5: 1 << 16,
        Key6: 1 << 17,
        Key7: 1 << 18,
        Key8: 1 << 19,
        FadeIn: 1 << 20,
        Random: 1 << 21,
        Cinema: 1 << 22,
        Target: 1 << 23,
        Key9: 1 << 24,
        KeyCoop: 1 << 25,
        Key1: 1 << 26,
        Key3: 1 << 27,
        Key2: 1 << 28,
        ScoreV2: 1 << 29,
        Mirror: 1 << 30
    },
    Names: {
        None: "No Mod",
        NoFail: "NF",
        Easy: "EZ",
        TouchDevice: "TD",
        Hidden: "HD",
        HardRock: "HR",
        SuddenDeath: "SD",
        DoubleTime: "DT",
        Relax: "RX",
        HalfTime: "HT",
        Nightcore: "NC",
        Flashlight: "FL",
        Autoplay: "AU",
        SpunOut: "SO",
        Relax2: "AP",
        Perfect: "PF",
        Key4: "4K",
        Key5: "5K",
        Key6: "6K",
        Key7: "7K",
        Key8: "8K",
        FadeIn: "FI",
        Random: "RD",
        Cinema: "CN",
        Target: "TP",
        Key9: "9K",
        KeyCoop: "2P",
        Key1: "1K",
        Key3: "3K",
        Key2: "2K",
        ScoreV2: "V2",
        Mirror: "MR"
    },
}

export interface CalculatorOut {
    performance: {
        aim: number
        speed: number
        acc: number
        fl: number
        total: number
    },
    difficulty: {
        Star: number
        MaxCombo: number
        Aim: number
        Speed: number
        Flashlight: number
        Slider: number
        AR: number
        OD: number
        CS: number
        HP: number
    }
}

var modbits = {
    nomod: 0,
    nf: 1 << 0,
    ez: 1 << 1,
    td: 1 << 2,
    hd: 1 << 3,
    hr: 1 << 4,
    dt: 1 << 6,
    ht: 1 << 8,
    nc: 1 << 9,
    fl: 1 << 10,
    so: 1 << 12,
};

export const BitModsFromString = (str: string) => {
    var mask = 0;
    str = str.toLowerCase();
    while (str != "") {
        var nchars = 1;
        for (var property in modbits) {
            if (property.length != 2) {
                continue;
            }
            if (!modbits.hasOwnProperty(property)) {
                continue;
            }
            if (str.startsWith(property)) {
                mask |= modbits[property];
                nchars = 2;
                break;
            }
        }
        str = str.slice(nchars);
    }
    return mask;
};