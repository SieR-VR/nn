import { URI } from 'vscode-uri';

export class ResourceMap<T> {
  private static readonly defaultPathNomalizer = (resource: URI): string =>
    resource.scheme === 'file'
      ? resource.fsPath
      : resource.toString();

  private readonly map = new Map<string, { readonly resource: URI; value: T }>();

  constructor(
    protected readonly pathNormalizer: (resource: URI) => string = ResourceMap.defaultPathNomalizer
  ) {}

  public get size(): number {
    return this.map.size;
  }

  public has(resource: URI): boolean {
    const file = this.toKey(resource);
    return !!file && this.map.has(file);
  }

  public get(resource: URI): T | undefined {
    const file = this.toKey(resource);
    return file ? this.map.get(file)?.value : undefined;
  }

  public set(resource: URI, value: T): void {
    const file = this.toKey(resource);
    if (!file) {
      return;
    }

    const entry = this.map.get(file);
    if (entry) {
      entry.value = value;
    } else {
      this.map.set(file, { resource, value });
    }
  }

  public delete(resource: URI): void {
    const file = this.toKey(resource);
    if (file) {
      this.map.delete(file);
    }
  }

  public clear(): void {
    this.map.clear();
  }

  public get values(): Iterable<T> {
    return [...this.map.values()].map(entry => entry.value);
  }

  public get entries(): Iterable<{ readonly resource: URI; value: T }> {
    return this.map.values();
  }

  public toKey(resource: URI): string | undefined {
    const key = this.pathNormalizer(resource);
    if (!key) {
      return key;
    }

    return key;
  }
}

export function getOrderedFileSet(map: ResourceMap<number>): ResourceMap<void> {
  const orderedFileSet = new ResourceMap<void>();
  const orderedResources = [...map.entries]
    .sort((a, b) => a.value - b.value)
    .map(entry => entry.resource);

  for (const resource of orderedResources) {
    orderedFileSet.set(resource, undefined);
  }

  return orderedFileSet;
}
