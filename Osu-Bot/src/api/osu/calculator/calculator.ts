import { CalculatorBase } from "./base";
import { CtbCalculator } from "./ctb";
import { ManiaCalculator } from "./mania";
import { StdCalculator } from "./osu";
import { TaikoCalculator } from "./taiko";








export class ApiCalculator {
    public static Calculators: CalculatorBase[] = [new StdCalculator(), new CtbCalculator(), new TaikoCalculator(), new ManiaCalculator()]
}