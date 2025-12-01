import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Sample astrologers data with Indian pandit-style images
const sampleAstrologers = [
    {
        id: '1',
        name: 'Pandit Ashok',
        specialties: ['Palmistry', 'Tarot', 'Life Coach'],
        experience: 10,
        price: 24,
        image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
        is_celebrity: false,
        is_online: true,
        rating: 5.0,
        reviews: 6908,
        languages: ['Punjabi', 'English', 'Hindi'],
    },
    {
        id: '2',
        name: 'Acharya MeenaS',
        specialties: ['Palmistry', 'Vedic', 'Numerology'],
        experience: 16,
        price: 24,
        image_url: 'https://randomuser.me/api/portraits/women/44.jpg',
        is_celebrity: false,
        is_online: true,
        rating: 5.0,
        reviews: 18918,
        languages: ['Punjabi', 'English', 'Hindi'],
        wait_time: '10m',
    },
    {
        id: '3',
        name: 'Rohan02',
        specialties: ['Palmistry', 'Vedic', 'Face Reading'],
        experience: 4,
        price: 25,
        image_url: 'https://randomuser.me/api/portraits/men/52.jpg',
        is_celebrity: false,
        is_online: true,
        rating: 5.0,
        reviews: 24684,
        languages: ['Punjabi', 'Hindi', 'Bhojpuri'],
        wait_time: '5m',
    },
    {
        id: '4',
        name: 'Guruji Harpreet',
        specialties: ['Vedic', 'Vastu', 'Numerology'],
        experience: 8,
        price: 30,
        image_url: 'https://randomuser.me/api/portraits/men/67.jpg',
        is_celebrity: true,
        is_online: true,
        rating: 4.9,
        reviews: 5432,
        languages: ['Punjabi', 'Hindi', 'English'],
    },
    {
        id: '5',
        name: 'Jyotishacharya Priya',
        specialties: ['Tarot', 'Crystal', 'Palmistry'],
        experience: 12,
        price: 28,
        image_url: 'https://randomuser.me/api/portraits/women/65.jpg',
        is_celebrity: false,
        is_online: true,
        rating: 4.8,
        reviews: 8765,
        languages: ['Hindi', 'English'],
    },
    {
        id: '6',
        name: 'Pt. Vinod Shastri',
        specialties: ['Vedic', 'Muhurta', 'Face Reading'],
        experience: 25,
        price: 35,
        image_url: 'https://randomuser.me/api/portraits/men/71.jpg',
        is_celebrity: true,
        is_online: false,
        rating: 4.9,
        reviews: 12340,
        languages: ['Hindi', 'English', 'Sanskrit'],
    },
]

export async function GET() {
    try {
        // Try to fetch from database
        const result = await query(
            'SELECT * FROM astrologers ORDER BY is_online DESC, rating DESC'
        )

        // If database has astrologers, return them
        if (result.rows && result.rows.length > 0) {
            return NextResponse.json({
                success: true,
                astrologers: result.rows,
            })
        }

        // Otherwise return sample data
        return NextResponse.json({
            success: true,
            astrologers: sampleAstrologers,
        })
    } catch (error: any) {
        console.error('Error fetching astrologers from database, returning sample data:', error)
        // On database error, return sample data
        return NextResponse.json({
            success: true,
            astrologers: sampleAstrologers,
        })
    }
}
