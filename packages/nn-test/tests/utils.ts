import * as fs from "fs";
import * as path from "path";

export function getErrorJson(dirname: string, source: string): string {
  const sourceWithoutExt = source.replace('.nn', '');
  const filePath: string = path.join(dirname, 'cases', `${sourceWithoutExt}.error.json`);

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
