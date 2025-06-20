import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/mongoose'
import AsrList from '../../../../../models/AsrList'
const UserScore = require('../../../../../models/UserScore')

export async function POST(request, { params }) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const { evaluationData, userEmail } = body

    console.log('ASR Evaluation request:', { id, evaluationData, userEmail })

    // Validate input
    if (!evaluationData) {
      return NextResponse.json(
        { success: false, error: 'Evaluation data is required' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      )
    }

    // Find the ASR
    const asrDoc = await AsrList.findOne({ asrNumber: id })
    if (!asrDoc) {
      return NextResponse.json(
        { success: false, error: 'ASR not found' },
        { status: 404 }
      )
    }

    // Check if already evaluated
    if (asrDoc.isEvaluated) {
      return NextResponse.json(
        { success: false, error: 'This ASR has already been evaluated' },
        { status: 400 }
      )
    }

    // Calculate average score from evaluation data
    const scores = [
      evaluationData.applicabilityOfResults,
      evaluationData.overallSatisfaction,
      evaluationData.researcherConsultation,
      evaluationData.timelinessOfService
    ].filter(score => typeof score === 'number')
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0

    // Update ASR with evaluation
    const updatedAsr = await AsrList.findOneAndUpdate(
      { asrNumber: id },
      {
        isEvaluated: true,
        asrEvaluationData: evaluationData,
        asrEvaluationScore: averageScore.toString(),
        evaluationDate: new Date(),
        evaluatedBy: userEmail
      },
      { new: true }
    )

    // Award points to user based on average score
    const pointsEarned = Math.max(1, Math.round(averageScore / 2)) // 1-5 points based on average score

    // Get or create user score record
    const userScore = await UserScore.getOrCreateUserScore(userEmail, 'User')
    console.log('Current user score:', userScore)

    // Add evaluation to user score
    await userScore.addEvaluation(id, pointsEarned, 'ASR Evaluation')
    console.log('Updated user score:', {
      totalEvaluations: userScore.totalEvaluations,
      totalPoints: userScore.totalPoints,
      averageRating: userScore.averageRating
    })

    console.log(`User ${userEmail} earned ${pointsEarned} points for evaluating ASR ${id}`)

    return NextResponse.json({
      success: true,
      data: {
        asr: updatedAsr,
        pointsEarned,
        totalPoints: userScore.totalPoints,
        userScore: userScore.totalEvaluations,
        averageRating: userScore.averageRating,
        averageScore
      },
      message: `ASR evaluation submitted successfully! You earned ${pointsEarned} points. Average score: ${averageScore}/10`
    })

  } catch (error) {
    console.error('Error submitting ASR evaluation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit evaluation' },
      { status: 500 }
    )
  }
}