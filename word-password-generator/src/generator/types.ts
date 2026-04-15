export type GenerationMode = "structure" | "targetLength";
export type Separator = "" | "-" | "_" | ".";
export type CaseMode = "lowercase" | "uppercase" | "capitalized";
export type WordLengthProfile = "short" | "medium" | "long" | "mixed";

export interface GeneratorConfig {
  generationMode: GenerationMode;
  wordCount: number;
  separator: Separator;
  caseMode: CaseMode;
  leetMode: boolean;
  wordLengthProfile: WordLengthProfile;
  targetLength: number | null;
  appendDigits: boolean;
  digitCount: number;
  appendSymbol: boolean;
  specialSymbol: string;
  easyToType: boolean;
  avoidAwkwardClusters: boolean;
  maxAttempts: number;
}

export interface BuildPasswordResult {
  password: string;
  length: number;
  words: string[];
}
