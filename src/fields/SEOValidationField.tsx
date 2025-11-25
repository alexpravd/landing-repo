'use client'

import React, { useMemo, useEffect } from 'react'
import { useField } from '@payloadcms/ui'
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Sparkles } from 'lucide-react'

interface SEOCheck {
  label: string
  status: 'pass' | 'warning' | 'fail'
  message: string
  points: number
}

export const SEOValidationField: React.FC = () => {
  // Get page title
  const { value: title } = useField<string>({ path: 'title' })

  // Get SEO fields using useField with proper paths
  const { value: metaTitle } = useField<string>({ path: 'seo.metaTitle' })
  const { value: metaDescription } = useField<string>({ path: 'seo.metaDescription' })
  const { value: focusKeyword } = useField<string>({ path: 'seo.focusKeyword' })
  const { value: keywords } = useField<string>({ path: 'seo.keywords' })
  const { value: metaImage } = useField<any>({ path: 'seo.metaImage' })
  const { value: ogTitle } = useField<string>({ path: 'seo.ogTitle' })
  const { value: ogDescription } = useField<string>({ path: 'seo.ogDescription' })
  const { value: ogImage } = useField<any>({ path: 'seo.ogImage' })
  const { value: twitterTitle } = useField<string>({ path: 'seo.twitterTitle' })
  const { value: twitterDescription } = useField<string>({ path: 'seo.twitterDescription' })
  const { value: twitterImage } = useField<any>({ path: 'seo.twitterImage' })
  const { value: canonicalUrl } = useField<string>({ path: 'seo.canonicalUrl' })

  // Debug: Log when values change
  useEffect(() => {
    console.log('🔄 SEO Field Changed - metaTitle:', metaTitle)
  }, [metaTitle])

  useEffect(() => {
    console.log('🔄 SEO Field Changed - metaDescription:', metaDescription)
  }, [metaDescription])

  const checks = useMemo((): SEOCheck[] => {
    const results: SEOCheck[] = []

    // Debug logging
    console.log('SEO Validation - Field Values:', {
      title,
      metaTitle,
      metaDescription,
      focusKeyword,
      keywords,
      metaImage,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonicalUrl
    })

    // Use metaTitle if provided, otherwise fall back to page title
    const effectiveTitle = metaTitle || title || ''
    const titleLength = effectiveTitle.length

    // Check 1: Meta Title Length
    if (titleLength === 0) {
      results.push({
        label: 'Meta Title',
        status: 'fail',
        message: 'No title set. Add a compelling page title.',
        points: 0
      })
    } else if (titleLength < 30) {
      results.push({
        label: 'Meta Title',
        status: 'warning',
        message: `Title is too short (${titleLength} chars). Aim for 50-60 characters.`,
        points: 5
      })
    } else if (titleLength > 70) {
      results.push({
        label: 'Meta Title',
        status: 'warning',
        message: `Title is too long (${titleLength} chars). It may be truncated in search results.`,
        points: 8
      })
    } else if (titleLength >= 50 && titleLength <= 60) {
      results.push({
        label: 'Meta Title',
        status: 'pass',
        message: `Perfect title length (${titleLength} chars).`,
        points: 15
      })
    } else {
      results.push({
        label: 'Meta Title',
        status: 'pass',
        message: `Good title length (${titleLength} chars).`,
        points: 12
      })
    }

    // Check 2: Meta Description
    const descLength = metaDescription?.length || 0
    if (descLength === 0) {
      results.push({
        label: 'Meta Description',
        status: 'fail',
        message: 'No meta description. This is crucial for click-through rates.',
        points: 0
      })
    } else if (descLength < 120) {
      results.push({
        label: 'Meta Description',
        status: 'warning',
        message: `Description is short (${descLength} chars). Aim for 150-160 characters.`,
        points: 8
      })
    } else if (descLength > 200) {
      results.push({
        label: 'Meta Description',
        status: 'warning',
        message: `Description is too long (${descLength} chars). It may be cut off.`,
        points: 10
      })
    } else if (descLength >= 150 && descLength <= 160) {
      results.push({
        label: 'Meta Description',
        status: 'pass',
        message: `Perfect description length (${descLength} chars).`,
        points: 20
      })
    } else {
      results.push({
        label: 'Meta Description',
        status: 'pass',
        message: `Good description length (${descLength} chars).`,
        points: 15
      })
    }

    // Check 3: Focus Keyword
    if (!focusKeyword) {
      results.push({
        label: 'Focus Keyword',
        status: 'warning',
        message: 'No focus keyword set. Add your main target keyword.',
        points: 0
      })
    } else {
      const keywordInTitle = effectiveTitle.toLowerCase().includes(focusKeyword.toLowerCase())
      const keywordInDesc = metaDescription?.toLowerCase().includes(focusKeyword.toLowerCase())

      if (keywordInTitle && keywordInDesc) {
        results.push({
          label: 'Focus Keyword',
          status: 'pass',
          message: `"${focusKeyword}" found in both title and description. Excellent!`,
          points: 15
        })
      } else if (keywordInTitle || keywordInDesc) {
        results.push({
          label: 'Focus Keyword',
          status: 'warning',
          message: `"${focusKeyword}" found in ${keywordInTitle ? 'title' : 'description'}. Consider adding to ${keywordInTitle ? 'description' : 'title'} too.`,
          points: 10
        })
      } else {
        results.push({
          label: 'Focus Keyword',
          status: 'warning',
          message: `"${focusKeyword}" not found in title or description. Consider adding it.`,
          points: 5
        })
      }
    }

    // Check 4: Keywords
    if (!keywords || keywords.trim().length === 0) {
      results.push({
        label: 'Keywords',
        status: 'warning',
        message: 'No keywords added. Add relevant keywords for better indexing.',
        points: 0
      })
    } else {
      const keywordCount = keywords.split(',').filter(k => k.trim().length > 0).length
      if (keywordCount < 3) {
        results.push({
          label: 'Keywords',
          status: 'warning',
          message: `Only ${keywordCount} keyword(s). Add 5-10 relevant keywords.`,
          points: 5
        })
      } else if (keywordCount > 15) {
        results.push({
          label: 'Keywords',
          status: 'warning',
          message: `${keywordCount} keywords is too many. Focus on 5-10 most relevant.`,
          points: 5
        })
      } else {
        results.push({
          label: 'Keywords',
          status: 'pass',
          message: `${keywordCount} keywords added. Good coverage!`,
          points: 10
        })
      }
    }

    // Check 5: Meta Image
    if (!metaImage && !ogImage && !twitterImage) {
      results.push({
        label: 'Social Media Image',
        status: 'fail',
        message: 'No images set. Add at least a meta image for social shares.',
        points: 0
      })
    } else if (metaImage || (ogImage && twitterImage)) {
      results.push({
        label: 'Social Media Image',
        status: 'pass',
        message: 'Social media images configured.',
        points: 10
      })
    } else {
      results.push({
        label: 'Social Media Image',
        status: 'warning',
        message: 'Partially configured. Add images for better social sharing.',
        points: 5
      })
    }

    // Check 6: Open Graph
    const hasOgTitle = ogTitle || metaTitle || title
    const hasOgDesc = ogDescription || metaDescription
    const hasOgImage = ogImage || metaImage

    if (hasOgTitle && hasOgDesc && hasOgImage) {
      results.push({
        label: 'Open Graph (Facebook)',
        status: 'pass',
        message: 'Fully optimized for Facebook/LinkedIn sharing.',
        points: 10
      })
    } else {
      const missing = []
      if (!hasOgTitle) missing.push('title')
      if (!hasOgDesc) missing.push('description')
      if (!hasOgImage) missing.push('image')

      results.push({
        label: 'Open Graph (Facebook)',
        status: 'warning',
        message: `Missing: ${missing.join(', ')}. Improve Facebook shares.`,
        points: 5
      })
    }

    // Check 7: Twitter Card
    const hasTwitterTitle = twitterTitle || ogTitle || metaTitle || title
    const hasTwitterDesc = twitterDescription || ogDescription || metaDescription
    const hasTwitterImage = twitterImage || ogImage || metaImage

    if (hasTwitterTitle && hasTwitterDesc && hasTwitterImage) {
      results.push({
        label: 'Twitter Card',
        status: 'pass',
        message: 'Fully optimized for Twitter/X sharing.',
        points: 10
      })
    } else {
      const missing = []
      if (!hasTwitterTitle) missing.push('title')
      if (!hasTwitterDesc) missing.push('description')
      if (!hasTwitterImage) missing.push('image')

      results.push({
        label: 'Twitter Card',
        status: 'warning',
        message: `Missing: ${missing.join(', ')}. Improve Twitter shares.`,
        points: 5
      })
    }

    // Check 8: Canonical URL (bonus)
    if (canonicalUrl) {
      results.push({
        label: 'Canonical URL',
        status: 'pass',
        message: 'Canonical URL set. Helps prevent duplicate content issues.',
        points: 10
      })
    }

    return results
  }, [title, metaTitle, metaDescription, focusKeyword, keywords, metaImage, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, canonicalUrl])

  const totalPoints = checks.reduce((sum, check) => sum + check.points, 0)
  const maxPoints = 100
  const score = Math.round((totalPoints / maxPoints) * 100)

  // Determine overall status
  let overallStatus: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  let statusColor: string
  let statusBg: string
  let statusIcon: React.ReactNode

  if (score >= 80) {
    overallStatus = 'excellent'
    statusColor = 'text-green-400'
    statusBg = 'bg-green-500/20'
    statusIcon = <CheckCircle className="h-6 w-6" />
  } else if (score >= 60) {
    overallStatus = 'good'
    statusColor = 'text-blue-400'
    statusBg = 'bg-blue-500/20'
    statusIcon = <TrendingUp className="h-6 w-6" />
  } else if (score >= 40) {
    overallStatus = 'needs-improvement'
    statusColor = 'text-yellow-400'
    statusBg = 'bg-yellow-500/20'
    statusIcon = <AlertCircle className="h-6 w-6" />
  } else {
    overallStatus = 'poor'
    statusColor = 'text-red-400'
    statusBg = 'bg-red-500/20'
    statusIcon = <XCircle className="h-6 w-6" />
  }

  const passCount = checks.filter(c => c.status === 'pass').length
  const warningCount = checks.filter(c => c.status === 'warning').length
  const failCount = checks.filter(c => c.status === 'fail').length

  return (
    <div className="seo-validation-widget">
      {/* Score Card */}
      <div className="score-card">
        <div className="score-sparkle">
          <Sparkles className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="score-header">
          <div className={`score-badge ${statusBg}`}>
            <div className={statusColor}>
              {statusIcon}
            </div>
            <span className="score-value">{score}<span className="score-percent">%</span></span>
          </div>
          <div className="score-info">
            <h3 className="score-title">SEO Health Score</h3>
            <p className="score-subtitle">
              {overallStatus === 'excellent' && '🎉 Excellent! Your page is well optimized.'}
              {overallStatus === 'good' && '👍 Good job! A few improvements will make it great.'}
              {overallStatus === 'needs-improvement' && '⚠️ Needs work. Follow the suggestions below.'}
              {overallStatus === 'poor' && '❌ Poor SEO. Please address the issues below.'}
            </p>
          </div>
        </div>

        <div className="score-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="score-stats">
          <div className="stat-item stat-pass">
            <CheckCircle className="h-4 w-4" />
            <span>{passCount} Passed</span>
          </div>
          <div className="stat-item stat-warning">
            <AlertCircle className="h-4 w-4" />
            <span>{warningCount} Warnings</span>
          </div>
          <div className="stat-item stat-fail">
            <XCircle className="h-4 w-4" />
            <span>{failCount} Failed</span>
          </div>
        </div>
      </div>

      {/* Checks List */}
      <div className="checks-list">
        {checks.map((check, index) => (
          <div key={index} className={`check-item check-${check.status}`}>
            <div className="check-icon">
              {check.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-400" />}
              {check.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-400" />}
              {check.status === 'fail' && <XCircle className="h-5 w-5 text-red-400" />}
            </div>
            <div className="check-content">
              <div className="check-header">
                <span className="check-label">{check.label}</span>
                <span className="check-points">{check.points}pts</span>
              </div>
              <p className="check-message">{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .seo-validation-widget {
          margin-bottom: 24px;
        }

        .score-card {
          position: relative;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .score-sparkle {
          position: absolute;
          top: 16px;
          right: 16px;
          opacity: 0.5;
        }

        .score-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .score-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 2px solid rgba(139, 92, 246, 0.3);
          backdrop-filter: blur(10px);
        }

        .score-value {
          font-size: 24px;
          font-weight: 700;
          color: #e5e7eb;
          margin-top: 6px;
          letter-spacing: -0.5px;
        }

        .score-percent {
          font-size: 16px;
          opacity: 0.8;
        }

        .score-info {
          flex: 1;
        }

        .score-title {
          color: #f3f4f6;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: -0.3px;
        }

        .score-subtitle {
          color: #d1d5db;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .score-progress {
          margin-bottom: 16px;
        }

        .progress-bar {
          height: 8px;
          background-color: rgba(31, 41, 55, 0.6);
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(75, 85, 99, 0.4);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          border-radius: 999px;
          transition: width 0.5s ease;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
        }

        .score-stats {
          display: flex;
          gap: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(75, 85, 99, 0.3);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d1d5db;
          font-size: 14px;
          font-weight: 500;
        }

        .stat-pass svg { color: #34d399; }
        .stat-warning svg { color: #fbbf24; }
        .stat-fail svg { color: #f87171; }

        .checks-list {
          background: rgba(31, 41, 55, 0.3);
          border: 1px solid rgba(75, 85, 99, 0.4);
          border-radius: 8px;
          overflow: hidden;
        }

        .check-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
          transition: background-color 0.2s ease;
        }

        .check-item:last-child {
          border-bottom: none;
        }

        .check-item:hover {
          background-color: rgba(55, 65, 81, 0.3);
        }

        .check-item.check-pass {
          background-color: rgba(16, 185, 129, 0.05);
          border-left: 3px solid #10b981;
        }

        .check-item.check-warning {
          background-color: rgba(245, 158, 11, 0.05);
          border-left: 3px solid #f59e0b;
        }

        .check-item.check-fail {
          background-color: rgba(239, 68, 68, 0.05);
          border-left: 3px solid #ef4444;
        }

        .check-icon {
          flex-shrink: 0;
          padding-top: 2px;
        }

        .check-content {
          flex: 1;
          min-width: 0;
        }

        .check-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .check-label {
          font-weight: 600;
          font-size: 14px;
          color: #f3f4f6;
        }

        .check-points {
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          background-color: rgba(55, 65, 81, 0.5);
          padding: 3px 10px;
          border-radius: 12px;
          border: 1px solid rgba(75, 85, 99, 0.4);
        }

        .check-message {
          font-size: 13px;
          color: #d1d5db;
          margin: 0;
          line-height: 1.6;
        }

        /* Dark theme specific enhancements */
        @media (prefers-color-scheme: dark) {
          .score-card {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          }

          .checks-list {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
        }
      `}</style>
    </div>
  )
}
