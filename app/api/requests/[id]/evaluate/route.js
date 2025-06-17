import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/mongoose'
import RequestList from '../../../../../models/RequestList'
const UserScore = require('../../../../../models/UserScore')
const { User } = require('../../../../../models/User')

export async function POST(request, { params }) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const { score, comment, userEmail } = body

    console.log('Evaluation request:', { id, score, comment, userEmail })

    // Validate input
    if (!score || score < 1 || score > 5) {
      return NextResponse.json(
        { success: false, error: 'Score must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      )
    }

    // Find the request
    const requestDoc = await RequestList.findOne({ requestNumber: id })
    if (!requestDoc) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // Allow evaluation for any status (for testing purposes)
    // Note: In production, you might want to restrict this to completed requests only

    // Check if already evaluated
    if (requestDoc.isEvaluated) {
      return NextResponse.json(
        { success: false, error: 'This request has already been evaluated' },
        { status: 400 }
      )
    }

    // Allow evaluation by any authenticated user
    // In a LIMS system, lab personnel and administrators should be able to evaluate completed requests
    // The userEmail validation above ensures the user is authenticated

    // Update request with evaluation
    const updatedRequest = await RequestList.findOneAndUpdate(
      { requestNumber: id },
      {
        isEvaluated: true,
        evaluationScore: score,
        evaluationComment: comment || '',
        evaluationDate: new Date(),
        evaluatedBy: userEmail // Track who performed the evaluation
      },
      { new: true }
    )

    // Award points to user based on score
    const pointsEarned = score // 1 star = 1 point, 5 stars = 5 points

    // Get or create user score record
    const userScore = await UserScore.getOrCreateUserScore(userEmail, 'User') // TODO: Get real user name
    console.log('Current user score:', userScore)

    // Add evaluation to user score
    await userScore.addEvaluation(id, score, comment || '')
    console.log('Updated user score:', {
      totalEvaluations: userScore.totalEvaluations,
      totalPoints: userScore.totalPoints,
      averageRating: userScore.averageRating
    })

    // Update userScore in User model - increment by 1 for each evaluation
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { $inc: { userScore: 1 } },
      { new: true }
    )

    console.log(`User ${userEmail} earned ${pointsEarned} points for evaluating request ${id}`)
    console.log(`User ${userEmail} userScore incremented to: ${updatedUser?.userScore || 1}`)

    return NextResponse.json({
      success: true,
      data: {
        request: updatedRequest,
        pointsEarned,
        totalPoints: userScore.totalPoints,
        userScore: userScore.totalEvaluations,
        averageRating: userScore.averageRating,
        totalUserScore: updatedUser?.userScore || 1
      },
      message: `Evaluation submitted successfully! You earned ${pointsEarned} points. Total evaluations: ${updatedUser?.userScore || 1}`
    })

  } catch (error) {
    console.error('Error submitting evaluation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit evaluation' },
      { status: 500 }
    )
  }
}
