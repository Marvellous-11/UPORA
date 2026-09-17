import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import { decimalToNumber } from "@/lib/wallet/ledger";

/** Returns the authenticated user's wallet balances and recent transactions. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to view your wallet.");

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 25,
        },
      },
    });

    if (!wallet) {
      return NextResponse.json({
        success: true,
        wallet: {
          availableBalance: 0,
          pendingEscrowBalance: 0,
          lifetimeEarnings: 0,
          currency: "USD",
        },
        transactions: [],
      });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        availableBalance: decimalToNumber(wallet.availableBalance),
        pendingEscrowBalance: decimalToNumber(wallet.pendingEscrowBalance),
        lifetimeEarnings: decimalToNumber(wallet.lifetimeEarnings),
        currency: wallet.currency,
      },
      transactions: wallet.transactions.map((t) => ({
        id: t.id,
        amount: decimalToNumber(t.amount),
        currency: t.currency,
        type: t.type,
        status: t.status,
        paymentGateway: t.paymentGateway,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/wallet error:", error);
    return apiError(500, "Failed to retrieve wallet.");
  }
}