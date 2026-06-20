import { lazy } from 'react'

export const KbList = lazy(() => import('./knowledge-base/KbList'))
export const KbDetail = lazy(() => import('./knowledge-base/KbDetail'))
export const QuestionList = lazy(() => import('./forum/QuestionList'))
export const QuestionDetail = lazy(() => import('./forum/QuestionDetail'))
export const AskQuestion = lazy(() => import('./forum/AskQuestion'))
export const ReviewList = lazy(() => import('./reviews/ReviewList'))
export const MyReviews = lazy(() => import('./reviews/MyReviews'))
export const WriteReview = lazy(() => import('./reviews/WriteReview'))
export const FeatureList = lazy(() => import('./features/FeatureList'))
export const SubmitFeature = lazy(() => import('./features/SubmitFeature'))
