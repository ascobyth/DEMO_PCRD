import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongoose'
const UserScore = require('../../../../models/UserScore')

export async function GET(request) {
  try {
    await dbConnect()

    // Get user email from query params or use default for demo
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email') || 'admin@admin.com'

    // Get or create user score record
    const userScore = await UserScore.getOrCreateUserScore(userEmail, 'User')

    // Get user ranking
    const ranking = await UserScore.getUserRanking(userEmail)

    return NextResponse.json({
      success: true,
      data: {
        score: userScore.totalEvaluations, // Number of evaluations done
        totalPoints: userScore.totalPoints,
        averageRating: userScore.averageRating,
        lastEvaluationDate: userScore.lastEvaluationDate,
        ranking: ranking,
        name: userScore.userName
      }
    })

  } catch (error) {
    console.error('Error fetching user score (Database may not be connected):', error)
    
    // Fallback response when database is not available
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      fallback: true,
      data: {
        score: 0,
        totalPoints: 0,
        averageRating: 0,
        name: 'User'
      }
    })
  }
}
