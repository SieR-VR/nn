import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    roots: ['./test'],
    preset: "ts-jest",
}

export default config;