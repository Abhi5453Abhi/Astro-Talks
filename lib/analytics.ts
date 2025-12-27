import { track } from '@vercel/analytics'
import { useEffect, useRef } from 'react'

/**
 * Analytics utility for Vercel Analytics tracking
 * Tracks all user interactions, button clicks, screen views, and timing
 */

export interface EventProperties {
    [key: string]: string | number | boolean | undefined
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: EventProperties) {
    try {
        track(eventName, properties)
        console.log('📊 Analytics:', eventName, properties)
    } catch (error) {
        console.error('Analytics tracking error:', error)
    }
}

/**
 * Track button/link clicks
 */
export function trackClick(
    elementName: string,
    location: string,
    additionalProps?: EventProperties
) {
    trackEvent('click', {
        element: elementName,
        location,
        ...additionalProps,
    })
}

/**
 * Track screen view
 */
export function trackScreenView(
    screenName: string,
    additionalProps?: EventProperties
) {
    trackEvent('screen_view', {
        screen: screenName,
        timestamp: new Date().toISOString(),
        ...additionalProps,
    })
}

/**
 * Track screen transition
 */
export function trackScreenTransition(from: string, to: string) {
    trackEvent('screen_transition', {
        from,
        to,
        timestamp: new Date().toISOString(),
    })
}

/**
 * Hook to track time spent on a screen
 */
export function useScreenTime(screenName: string) {
    const startTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        // Track screen view on mount
        trackScreenView(screenName)
        startTimeRef.current = Date.now()

        // Track time spent on unmount
        return () => {
            const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
            trackEvent('time_on_screen', {
                screen: screenName,
                duration_seconds: timeSpent,
            })
        }
    }, [screenName])
}

/**
 * Track form interactions
 */
export function trackFormEvent(
    formName: string,
    action: 'start' | 'complete' | 'abandon' | 'error',
    additionalProps?: EventProperties
) {
    trackEvent(`form_${action}`, {
        form: formName,
        ...additionalProps,
    })
}

/**
 * Track onboarding steps
 */
export function trackOnboardingStep(
    step: number,
    stepName: string,
    action: 'view' | 'complete',
    additionalProps?: EventProperties
) {
    trackEvent(`onboarding_step_${action}`, {
        step,
        step_name: stepName,
        ...additionalProps,
    })
}

/**
 * Track chat events
 */
export function trackChatEvent(
    action: 'message_sent' | 'free_chat_claimed' | 'timer_milestone' | 'timer_expired',
    additionalProps?: EventProperties
) {
    trackEvent(`chat_${action}`, additionalProps)
}

/**
 * Track payment events
 */
export function trackPaymentEvent(
    action: 'modal_open' | 'amount_selected' | 'initiated' | 'success' | 'failed',
    additionalProps?: EventProperties
) {
    trackEvent(`payment_${action}`, additionalProps)
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
    featureName: string,
    action: string,
    additionalProps?: EventProperties
) {
    trackEvent('feature_used', {
        feature: featureName,
        action,
        ...additionalProps,
    })
}
