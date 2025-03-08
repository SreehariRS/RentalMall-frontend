// pages/api/verify-email.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getVerificationTokenByToken } from '@/app/data/verification-token';
import { newVerification } from '@/app/actions/new-verification';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { token } = req.body;

    try {
      const verificationResponse = await newVerification(token);

      if (verificationResponse.error) {
        return res.status(400).json({ error: verificationResponse.error });
      }

      return res.status(200).json({ success: verificationResponse.sucess });
    } catch (error) {
      console.error('Error during verification:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
