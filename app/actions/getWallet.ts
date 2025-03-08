import prisma from '@/app/libs/prismadb';

export async function getOrCreateWallet(userId: string) {
  try {
    // Check if the user already has a wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    // If no wallet exists, create one
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0.0,
        },
      });
      // Update the user's walletId
      await prisma.user.update({
        where: { id: userId },
        data: { walletId: wallet.id },
      });
    }

    return wallet;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to get or create wallet: ${error.message}`);
    }
    throw new Error("Failed to get or create wallet: Unknown error occurred");
  }
}

export async function getWalletBalance(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return wallet.balance;
}