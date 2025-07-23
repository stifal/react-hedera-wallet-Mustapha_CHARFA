// src/utils/retry.util.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500,
  factor = 2,
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      await new Promise((res) => setTimeout(res, delay));
      delay *= factor;
    }
  }
  throw new Error('Max retries reached');
}