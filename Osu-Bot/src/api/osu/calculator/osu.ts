import { Beatmaps } from "@osuapi/endpoints/beatmap";
import { Errors, OsuApiError } from "@osuapi/error";
import { Utils } from "@osuapi/functions";
import { exec as _exec } from "child_process"
import { promisify } from "util";
import { BeatmapParserAttributes, BeatmapParserOut, BitModsFromString, CalculateParams, CalculatorBase, CalculatorMultipleOut, CalculatorOut, Mods, MultipleParams } from "./base";

const exec = promisify(_exec)


export class StdCalculator implements CalculatorBase {
    public async CalculateMultipleAccs(map: Beatmaps.FromId, params: MultipleParams): Promise<CalculatorMultipleOut> {
        const mods = (typeof params.Mods === "object" ? params.Mods : Utils.ConvertBitModsToModsArr(params.Mods)).map(mod => `-m ${mod}`).join(" ")
        const bitMods = typeof params.Mods === "object" ? BitModsFromString(params.Mods.join()) : params.Mods
        
        const execCmd = `${process.env.OSU_PERFORMANCE_PATH} difficulty --ruleset:0 ${mods} -j ${map.Id}`
        let rawRes = (await exec(execCmd)).stdout
        const execRes = rawRes.startsWith("Downloading") ? rawRes.split("\r")[1] : rawRes

        let out: BeatmapParserOut
        try {
            out = JSON.parse(execRes) as BeatmapParserOut
        } catch (err) {
            console.log("Unexpected result from osu performance calculator")
            console.log(execCmd);
            process.stdout.write(rawRes + "\n")
            throw new OsuApiError(Errors.Unknown, "Unknown error")
        }

        const difficulty = out.results[0].attributes
        const counts = params.Accuracy.map(acc => ({ counts: Utils.AccToCounts(acc, map.Counts), acc }))
        const performance = counts.map(c => ({ acc: c.acc, performance: computeTotalValue(map, difficulty, params.Combo, c.counts, bitMods), counts: c.counts }))
        return {
            calculated: performance, difficulty: {
                Star: difficulty.star_rating,
                MaxCombo: difficulty.max_combo,
                Aim: difficulty.aim_difficulty,
                Speed: difficulty.speed_difficulty,
                Flashlight: difficulty.flashlight_difficulty,
                Slider: difficulty.slider_factor,
                AR: difficulty.approach_rate,
                OD: difficulty.overall_difficulty,
                CS: bitMods & Mods.Bit.HardRock ? map.Difficulty.CS * 1.4 : map.Difficulty.CS,
                HP: bitMods & Mods.Bit.HardRock ? map.Difficulty.HP * 1.4 : map.Difficulty.HP
            }
        }
    }
    public async Calculate(map: Beatmaps.FromId, params: CalculateParams): Promise<CalculatorOut> {
        const mods = (typeof params.Mods === "object" ? params.Mods : Utils.ConvertBitModsToModsArr(params.Mods)).map(mod => `-m ${mod}`).join(" ")
        const bitMods = typeof params.Mods === "object" ? BitModsFromString(params.Mods.join()) : params.Mods

        const execCmd = `${process.env.OSU_PERFORMANCE_PATH} difficulty --ruleset:0 ${mods} -j ${map.Id}`
        const rawRes = (await exec(execCmd)).stdout
        let execRes = rawRes
        if (execRes.startsWith("Downloading")) execRes = execRes.split("\r")[1]

        let out: BeatmapParserOut
        try {
            out = JSON.parse(execRes) as BeatmapParserOut
        } catch (err) {
            console.log("Unexpected result from osu performance calculator")
            console.log(execCmd);
            process.stdout.write(rawRes + "\n")
            throw new OsuApiError(Errors.Unknown, "Unknown error")
        }
        const difficulty = out.results[0].attributes
        const performance = computeTotalValue(map, difficulty, params.Combo, params.Counts, bitMods)
        return {
            performance, difficulty: {
                Star: difficulty.star_rating,
                MaxCombo: difficulty.max_combo,
                Aim: difficulty.aim_difficulty,
                Speed: difficulty.speed_difficulty,
                Flashlight: difficulty.flashlight_difficulty,
                Slider: difficulty.slider_factor,
                AR: difficulty.approach_rate,
                OD: difficulty.overall_difficulty,
                CS: bitMods & Mods.Bit.HardRock ? map.Difficulty.CS * 1.4 : map.Difficulty.CS,
                HP: bitMods & Mods.Bit.HardRock ? map.Difficulty.HP * 1.4 : map.Difficulty.HP
            }
        }
    }
}

interface hitcounts { "50": number, "100": number, "300": number, "geki": number, "katu": number, "miss": number }

const Accuracy = (counts: hitcounts) => {
    if (TotalHits(counts) == 0)
        return 0;

    return Math.min(Math.max((counts[50] * 50 + counts["100"] * 100 + counts["300"] * 300) / (TotalHits(counts) * 300), 0), 1);
}

const TotalHits = (counts: hitcounts) => {
    return counts["50"] + counts["100"] + counts["300"] + counts.miss;
}

const TotalSuccessfulHits = (counts: hitcounts) => {
    return counts["50"] + counts["100"] + counts["300"]
}

const computeEffectiveMissCount = (beatmap: Beatmaps.FromId, scoreCombo: number, counts: hitcounts) => {
    let comboBasedMissCount = 0
    let beatmapMaxCombo = beatmap.MaxCombo
    if (beatmap.Counts.sliders > 0) {
        let fullComboThreshold = beatmapMaxCombo - 0.1 * beatmap.Counts.sliders
        if (scoreCombo < fullComboThreshold)
            comboBasedMissCount = fullComboThreshold / Math.max(1, scoreCombo)
    }

    comboBasedMissCount = Math.min(comboBasedMissCount, (TotalHits(counts)))

    return Math.max((counts.miss), comboBasedMissCount)
}

const computeTotalValue = (beatmap: Beatmaps.FromId, difficulty: BeatmapParserAttributes, scoreCombo: number, counts: hitcounts, mods: number) => {
    let multiplier = 1.12
    let misscount = computeEffectiveMissCount(beatmap, scoreCombo, counts)

    if ((mods & Mods.Bit.NoFail) > 0)
        multiplier *= Math.max(0.9, 1 - 0.02 * misscount)

    let numTotalHits = TotalHits(counts)
    if ((mods & Mods.Bit.SpunOut) > 0)
        multiplier *= 1 - Math.pow(beatmap.Counts.spinners / (numTotalHits), 0.85)

    let aim = computeAimValue(beatmap, difficulty, misscount, scoreCombo, counts, mods)
    let speed = computeSpeedValue(beatmap, difficulty, misscount, scoreCombo, counts, mods)
    let acc = computeAccuracyValue(beatmap, difficulty, counts, mods)
    let fl = computeFlashlightValue(beatmap, difficulty, misscount, scoreCombo, counts, mods)
    let total = Math.pow(
        Math.pow(aim, 1.1) +
        Math.pow(speed, 1.1) +
        Math.pow(acc, 1.1) +
        Math.pow(fl, 1.1),
        1 / 1.1) *
        multiplier
    return { aim, speed, acc, fl, total }
}

const computeAimValue = (beatmap: Beatmaps.FromId, difficulty: BeatmapParserAttributes, misscount: number, scoreCombo: number, counts: hitcounts, mods: number) => {
    let rawAim = difficulty.aim_difficulty;

    if ((mods & Mods.Bit.TouchDevice) > 0)
        rawAim = Math.pow(rawAim, 0.8);

    let aim = Math.pow(5 * Math.max(1, rawAim / 0.0675) - 4, 3) / 100000

    let numTotalHits = TotalHits(counts);

    let lengthBonus = 0.95 + 0.4 * Math.min(1, (numTotalHits) / 2000) +
        (numTotalHits > 2000 ? Math.log10((numTotalHits) / 2000) * 0.5 : 0);
    aim *= lengthBonus;

    if (misscount > 0)
        aim *= 0.97 * Math.pow(1 - Math.pow(misscount / (numTotalHits), 0.775), misscount)

    aim *= getComboScalingFactor(beatmap, scoreCombo)

    let approachRate = difficulty.approach_rate
    let approachRateFactor = 0
    if (approachRate > 10.33)
        approachRateFactor = 0.3 * (approachRate - 10.33)
    else if (approachRate < 8)
        approachRateFactor = 0.1 * (8 - approachRate)

    aim *= 1 + approachRateFactor * lengthBonus

    if ((mods & Mods.Bit.Hidden) > 0)
        aim *= 1 + 0.04 * (12 - approachRate)

    let estimateDifficultSliders = beatmap.Counts.sliders * 0.15

    if (beatmap.Counts.sliders > 0) {
        let maxCombo = beatmap.MaxCombo
        let estimateSliderEndsDropped = Math.min(Math.max(Math.min((counts[100] + counts[50] + counts.miss), maxCombo - scoreCombo), 0), estimateDifficultSliders);
        let sliderFactor = difficulty.slider_factor
        let sliderNerfFactor = (1 - sliderFactor) * Math.pow(1 - estimateSliderEndsDropped / estimateDifficultSliders, 3) + sliderFactor;
        aim *= sliderNerfFactor;
    }

    aim *= Accuracy(counts)
    aim *= 0.98 + (Math.pow(difficulty.overall_difficulty, 2) / 2500)
    return aim
}

const computeSpeedValue = (beatmap: Beatmaps.FromId, difficulty: BeatmapParserAttributes, misscount: number, scoreCombo: number, counts: hitcounts, mods: number) => {
    let speed = Math.pow(5 * Math.max(1, difficulty.speed_difficulty / 0.0675) - 4, 3) / 100000

    let numTotalHits = TotalHits(counts)

    let lengthBonus = 0.95 + 0.4 * Math.min(1, (numTotalHits) / 2000) +
        (numTotalHits > 2000 ? Math.log10((numTotalHits) / 2000) * 0.5 : 0)
    speed *= lengthBonus;

    if (misscount > 0)
        speed *= 0.97 * Math.pow(1 - Math.pow(misscount / (numTotalHits), 0.775), Math.pow(misscount, 0.875))

    speed *= getComboScalingFactor(beatmap, scoreCombo);

    let approachRate = difficulty.approach_rate
    let approachRateFactor = 0
    if (approachRate > 10.33)
        approachRateFactor = 0.3 * (approachRate - 10.33)

    speed *= 1 + approachRateFactor * lengthBonus

    if ((mods & Mods.Bit.Hidden) > 0)
        speed *= 1 + 0.04 * (12 - approachRate)

    speed *= (0.95 + Math.pow(difficulty.overall_difficulty, 2) / 750) * Math.pow(Accuracy(counts), (14.5 - Math.max(difficulty.overall_difficulty, 8)) / 2)
    speed *= Math.pow(0.98, counts[50] < numTotalHits / 500 ? 0 : counts[50] - numTotalHits / 500)
    return speed
}

const computeAccuracyValue = (beatmap: Beatmaps.FromId, difficulty: BeatmapParserAttributes, counts: hitcounts, mods: number) => {
    let betterAccuracyPercentage: number

    let numHitObjectsWithAccuracy: number
    if (mods & Mods.Bit.ScoreV2) {
        numHitObjectsWithAccuracy = TotalHits(counts);
        betterAccuracyPercentage = Accuracy(counts);
    } else {
        numHitObjectsWithAccuracy = beatmap.Counts.circles
        if (numHitObjectsWithAccuracy > 0)
            betterAccuracyPercentage = ((counts[300] - (TotalHits(counts) - numHitObjectsWithAccuracy)) * 6 + counts[100] * 2 + counts[50]) / (numHitObjectsWithAccuracy * 6);
        else
            betterAccuracyPercentage = 0

        if (betterAccuracyPercentage < 0)
            betterAccuracyPercentage = 0
    }

    let acc =
        Math.pow(1.52163, difficulty.overall_difficulty) * Math.pow(betterAccuracyPercentage, 24) *
        2.83

    acc *= Math.min(1.15, (Math.pow(numHitObjectsWithAccuracy / 1000, 0.3)))

    if ((mods & Mods.Bit.Hidden) > 0)
        acc *= 1.08

    if ((mods & Mods.Bit.Flashlight) > 0)
        acc *= 1.02
    return acc
}

const computeFlashlightValue = (beatmap: Beatmaps.FromId, difficulty: BeatmapParserAttributes, misscount: number, scoreCombo: number, counts: hitcounts, mods: number) => {
    let fl = 0

    if ((mods & Mods.Bit.Flashlight) == 0)
        return fl

    let rawFlashlight = difficulty.flashlight_difficulty

    if ((mods & Mods.Bit.TouchDevice) > 0)
        rawFlashlight = Math.pow(rawFlashlight, 0.8)

    fl = Math.pow(rawFlashlight, 2) * 25

    if ((mods & Mods.Bit.Hidden) > 0)
        fl *= 1.3

    let numTotalHits = TotalHits(counts)

    if (misscount > 0)
        fl *= 0.97 * Math.pow(1 - Math.pow(misscount / (numTotalHits), 0.775), Math.pow(misscount, 0.875))

    fl *= getComboScalingFactor(beatmap, scoreCombo);

    fl *= 0.7 + 0.1 * Math.min(1, (numTotalHits) / 200) +
        (numTotalHits > 200 ? 0.2 * Math.min(1, ((numTotalHits) - 200) / 200) : 0)

    fl *= 0.5 + Accuracy(counts) / 2
    fl *= 0.98 + Math.pow(difficulty.overall_difficulty, 2) / 2500
    return fl
}

const getComboScalingFactor = (beatmap: Beatmaps.FromId, scoreCombo: number) => {
    let maxCombo = beatmap.MaxCombo
    if (maxCombo > 0)
        return Math.min((Math.pow(scoreCombo, 0.8) / Math.pow(maxCombo, 0.8)), 1)
    return 1
}