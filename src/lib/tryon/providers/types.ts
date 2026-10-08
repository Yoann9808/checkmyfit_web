export type TryOnInput = {
  person: { data: Buffer; mimeType: string };
  garment: { data: Buffer; mimeType: string };
  garmentInfo: {
    name: string;
    category: string;
    color: string | null;
    description: string | null;
    gender: string;
  };
};

export type TryOnOutput = {
  data: Buffer;
  mimeType: string;
};

export interface TryOnProvider {
  readonly name: string;
  generate(input: TryOnInput): Promise<TryOnOutput>;
}

export class TryOnProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "TryOnProviderError";
  }
}
