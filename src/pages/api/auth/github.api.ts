import type { NextApiRequest, NextApiResponse } from 'next'

export async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
): Promise<void> {
  return response.end()
}
