import { Beatmaps } from "@osuapi/endpoints/beatmap";
import { CalculateParams, CalculatorBase, CalculatorOut } from "./base";

export class CtbCalculator extends CalculatorBase {
    public async Calculate(map: Beatmaps.FromId, params: CalculateParams): Promise<any> {};
    constructor() {super()};
} 