"use client"
import prisma from "../libs/prismadb"
import { getUserByEmail } from "../data/user"
import { getVerificationTokenByToken } from "../data/verification-token"


export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);
  
    // Check if the token exists
    if (!existingToken) {
      return { error: "invalid token" };
    }
  

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return { error: "Token has expired" };
    }
  
    const existingUser = await getUserByEmail(existingToken.email)
    if(!existingUser){
        return {error:"User not found"}
    }
    await prisma.user.update({
        where:{
            id:existingUser.id
        },
        data:{
            emailVerified:new Date(),
            email:existingToken.email
        }
    })
    await prisma.verificationToken.delete({
        where:{
            id:existingToken.id
        }
    })
    return {sucess:"Email verified"}
  };